import {
  showError,
  showNotice,
  showSuccess,
} from "figma-plugin-utilities/lib/figma-helpers";
import { plural, UNDO } from "figma-plugin-utilities/lib/format";
figma.showUI(__html__, { themeColors: true, width: 240, height: 248 });

/**
 * Parses a single component set and returns its properties and values.
 * @param node A ComponentSetNode to analyze.
 * @returns A map of property names to a Set of their values.
 */
function getPropertiesFromSet(
  node: ComponentSetNode,
): Map<string, Set<string>> {
  const properties = new Map<string, Set<string>>();
  for (const variant of node.children) {
    if (variant.type === "COMPONENT") {
      const parts = variant.name.split(",").map((p) => p.trim());
      for (const part of parts) {
        const [propName, propValue] = part.split("=").map((p) => p.trim());
        if (propName && propValue) {
          if (!properties.has(propName)) {
            properties.set(propName, new Set());
          }
          properties.get(propName)!.add(propValue);
        }
      }
    }
  }
  return properties;
}

/**
 * Analyzes the user's selection to find common properties for renaming.
 */
function analyzeSelection() {
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    figma.ui.postMessage({
      type: "ERROR",
      message: "Select one or more component sets.",
    });
    return;
  }

  const componentSets = selection.filter(
    (node) => node.type === "COMPONENT_SET",
  ) as ComponentSetNode[];

  if (componentSets.length !== selection.length) {
    figma.ui.postMessage({
      type: "ERROR",
      message: "All selected layers must be component sets.",
    });
    return;
  }

  // Get properties from the first set to serve as the baseline for comparison
  let commonProperties = getPropertiesFromSet(componentSets[0]);

  // Intersect with properties from the other selected sets
  for (let i = 1; i < componentSets.length; i++) {
    const nextSetProperties = getPropertiesFromSet(componentSets[i]);
    const intersectedProps = new Map<string, Set<string>>();

    for (const [propName, propValues] of commonProperties.entries()) {
      if (nextSetProperties.has(propName)) {
        // Find the intersection of values for this common property
        const nextValues = nextSetProperties.get(propName)!;
        const commonValues = new Set(
          [...propValues].filter((v) => nextValues.has(v)),
        );

        if (commonValues.size > 0) {
          intersectedProps.set(propName, commonValues);
        }
      }
    }
    commonProperties = intersectedProps;
  }

  if (commonProperties.size === 0) {
    figma.ui.postMessage({
      type: "ERROR",
      message:
        "No shared properties with common values found across the selection.",
    });
    return;
  }

  // Convert the Map and Sets to a plain object with arrays for the UI
  const propertiesForUI: Record<string, string[]> = {};
  for (const [propName, values] of commonProperties.entries()) {
    propertiesForUI[propName] = Array.from(values);
  }

  figma.ui.postMessage({ type: "INIT_PROPERTIES", data: propertiesForUI });
}

// Why a new variant value can't be used, or null when it can. Variant names
// are "property=value" pairs joined by commas, so a value can't hold either.
const newValueError = (value: unknown): string | null => {
  if (typeof value !== "string" || value.trim() === "") {
    return "Enter a new value.";
  }
  if (value.length > 100) {
    return "Shorten the new value to 100 characters or fewer.";
  }
  if (value.includes("=") || value.includes(",")) {
    return 'Remove "=" and "," from the new value: variant names use them.';
  }
  return null;
};

figma.on("selectionchange", analyzeSelection);

// Listen for messages from the UI to perform actions
figma.ui.onmessage = (msg) => {
  if (msg.type === "RENAME_VALUE") {
    const { property, oldValue, newValue } = msg;

    // The UI checks the new value first; this guards the file.
    const invalid = newValueError(newValue);
    if (invalid) {
      showError(invalid);
      return;
    }

    // IMPORTANT: Use figma.currentPage.selection here again to ensure we are renaming the CURRENT selection,
    // even if the user clicked something else after the UI loaded.
    const componentSets = figma.currentPage.selection.filter(
      (node) => node.type === "COMPONENT_SET",
    ) as ComponentSetNode[];
    let totalRenameCount = 0;
    const collidingSets: string[] = [];

    // Variants with the same properties in any order are the same combination
    const combo = (parts: string[]) => [...parts].sort().join(",");

    for (const set of componentSets) {
      const renames: Array<{ variant: ComponentNode; parts: string[] }> = [];
      const combos = new Map<string, number>();

      for (const variant of set.children) {
        if (variant.type !== "COMPONENT") continue;

        const currentProps = variant.name.split(",").map((p) => p.trim());
        const targetPropIndex = currentProps.findIndex(
          (p) => p.trim() === `${property}=${oldValue}`,
        );

        if (targetPropIndex !== -1) {
          // Reconstruct the name with the new value
          currentProps[targetPropIndex] = `${property}=${newValue}`;
          renames.push({ variant, parts: currentProps });
        }
        const key = combo(currentProps);
        combos.set(key, (combos.get(key) ?? 0) + 1);
      }

      // Renaming must not give two variants the same property combination
      if (
        renames.length > 0 &&
        [...combos.values()].some((count) => count > 1)
      ) {
        collidingSets.push(set.name);
        continue;
      }

      for (const { variant, parts } of renames) {
        variant.name = parts.join(", ");
        totalRenameCount++;
      }
    }

    if (collidingSets.length > 0) {
      const names = collidingSets.map((n) => `"${n}"`).join(", ");
      const renamed =
        totalRenameCount > 0
          ? ` Renamed ${plural(totalRenameCount, "variant")} in the other sets.`
          : "";
      showError(
        `Couldn't rename in ${plural(collidingSets.length, "component set")}: ${names} already ${collidingSets.length === 1 ? "has" : "have"} a variant with ${property}=${newValue}. Choose a different new value.${renamed}`,
      );
    } else if (totalRenameCount === 0) {
      showNotice(
        `No selected variant has ${property}=${oldValue}. Select the component sets again.`,
      );
    } else {
      showSuccess(
        `Renamed ${plural(totalRenameCount, "variant")} from "${oldValue}" to "${newValue}". ${UNDO}`,
      );
    }
    analyzeSelection();
  }
};

analyzeSelection();
