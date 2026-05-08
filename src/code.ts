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
      message: "Please select one or more component sets.",
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

figma.on("selectionchange", analyzeSelection);

// Listen for messages from the UI to perform actions
figma.ui.onmessage = (msg) => {
  if (msg.type === "RENAME_VALUE") {
    const { property, oldValue, newValue } = msg;

    if (!newValue || newValue.trim() === "") {
      figma.notify("New value cannot be empty.", { error: true });
      return;
    }
    if (newValue.length > 100) {
      figma.notify("New value must be 100 characters or fewer.", {
        error: true,
      });
      return;
    }
    if (newValue.includes("=") || newValue.includes(",")) {
      figma.notify('New value cannot contain "=" or "," characters.', {
        error: true,
      });
      return;
    }

    // IMPORTANT: Use figma.currentPage.selection here again to ensure we are renaming the CURRENT selection,
    // even if the user clicked something else after the UI loaded.
    const componentSets = figma.currentPage.selection.filter(
      (node) => node.type === "COMPONENT_SET",
    ) as ComponentSetNode[];
    let totalRenameCount = 0;

    for (const set of componentSets) {
      for (const variant of set.children) {
        if (variant.type !== "COMPONENT") continue;

        const currentProps = variant.name.split(",").map((p) => p.trim());
        const targetPropIndex = currentProps.findIndex(
          (p) => p.trim() === `${property}=${oldValue}`,
        );

        if (targetPropIndex !== -1) {
          // Reconstruct the name with the new value
          currentProps[targetPropIndex] = `${property}=${newValue}`;
          variant.name = currentProps.join(", ");
          totalRenameCount++;
        }
      }
    }

    figma.notify(
      `✅ Renamed ${totalRenameCount} total variants from "${oldValue}" to "${newValue}".`,
    );
    analyzeSelection();
  }
};

analyzeSelection();
