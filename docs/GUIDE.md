# Batch Rename Variants

Batch Rename Variants renames one variant value in every component set you select, for example `size=sm` to `size=small`. It lists only the properties and values that all the selected sets share.

## Rename a value

![](batch-rename-form.png)

Select one or more component sets, then run the plugin. The form follows the selection: select other sets and the lists update.

1. **Property to change** — a variant property of the selected sets.
2. **Value to rename** — a value of that property. Every selected set has it.
3. **New value** — the new name for the value. It can be up to 100 characters, without `=` or `,`.

Click **Rename** to rename the value in every variant that has it. The other properties in each variant's name stay as they are. Press Ctrl/Cmd+Z to undo.

When the selection is empty, holds a layer that is not a component set, or has sets that share no value, the plugin says what to change instead of showing the form.
