# Change Log

All notable changes to the "Beam Me Up, Scotty!" extension will be documented in this file.

## [0.4.0] - 2026-10-16

- All eight commands now appear in the Command Palette under **Scotty**. Previously only Jump Forward and Jump Backward did.
- Commands accept the characters to jump to as an argument, so a keybinding can jump straight to a character without the prompt.
- Fix Select Backward moving the selection's starting point after a Select Forward.
- The editor now scrolls to show the jump target.
- Status bar messages clear after a few seconds instead of staying until replaced.
- Edits in other files no longer cancel a repeat jump.
- Case-insensitive search no longer lands on the wrong offset for characters whose lowercase form has a different length.
- Rewrite README and shorten the description.
- Move to the Keymaps category.

## [0.3.0] - 2024-07-02

- Use `Ctrl` instead of `Cmd` on macOS, so the shortcuts don't interfere with the app's zoom reset (`Cmd+0`).

## [0.1.2] - 2024-06-20

- Initial release.
- Jump and select forward and backward to characters.
- Case-insensitive variants of each command.
