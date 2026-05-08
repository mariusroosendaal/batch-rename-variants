# Changelog

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
