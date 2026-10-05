# Batch Rename Variants

Batch Rename Variants renames a variant value in every component set you select, such as `size=sm` to `size=small`. It lists only the properties and values the selected sets share.

## Rename a value

![](batch-rename-form.svg)

Select one or more component sets, then run the plugin. The lists follow your selection.

1. **Property to change** — a variant property of the selected sets.
2. **Value to rename** — a value every selected set has.
3. **New value** — up to 100 characters, without `=` or `,`.

Click **Rename** to rename the value in every variant that has it. Press Ctrl/Cmd+Z to undo.

If you see a message instead of the form, select only component sets, not their variants. If the sets share no value, select sets that have one in common.
