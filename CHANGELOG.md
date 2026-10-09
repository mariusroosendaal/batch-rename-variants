# Changelog

## [Unreleased]

### Fixed

- Renaming a value to one that another variant in the same component set already has skips that set and names it in a red notification, instead of creating variants with identical properties

### Changed

- The rename ends with a count of the renamed variants and the undo shortcut, without the emoji. When no selected variant has the value, a regular notification says so, where it used to report 0 as a success
- **New value** shows what's wrong with a value (too long, or with "=" or ",") under the field, and **Rename** stays disabled until it's fixed, where a red notification used to follow the click

## [1.0.2] - 2026-07-06

### Fixed

- The Value dropdown always snapped back to its first option after picking any other item, making it impossible to select a value other than the first — caused by a reactive statement that got entangled with the dropdown's two-way binding

## [1.0.1] - 2026-05-08

### Fixed

- Switching the Property dropdown now resets the Value dropdown to the first valid option for that property (previously the old value stayed selected, leading to silent zero-rename outcomes)

### Changed

- Disabled Rename button shows a tooltip explaining why it is disabled when the form is visible
- New value input is capped at 100 characters
- Validation error on the error state now correctly marks it as an alert for assistive technology
- Form inputs have associated labels and accessible names on all dropdowns

## [1.0.0] - 2026-04-17

### Changed

- **Auto-refresh after rename** — The UI now reloads the properties and values after a successful rename, so the updated names are reflected immediately without reopening the plugin
- **Preserve property selection** — The selected property stays active after a refresh; only the value dropdown and new value input are reset
- **UI** — Updated to Figma UI3
