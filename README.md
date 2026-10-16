# Beam Me Up, Scotty!

[![CI](https://github.com/wheredoesyourmindgo/vscode-scotty/actions/workflows/ci.yml/badge.svg)](https://github.com/wheredoesyourmindgo/vscode-scotty/actions/workflows/ci.yml)

Jump to, or select up to, the next or previous occurrence of any characters in the current file, without leaving the keyboard. If you've used [clever-f.vim](https://github.com/rhysd/clever-f.vim), this will feel familiar.

## How it works

1. Press `Ctrl+0` to jump forward, or `Ctrl+7` to jump back.
2. Type one or more characters and press `Enter`. The cursor lands on the next (or previous) match.
3. Press `Ctrl+0` or `Ctrl+7` again to keep jumping to the same characters. You won't be asked again.

Moving the cursor yourself, editing the file, or switching editors ends the repeat, and the next jump asks for new characters.

Add `Shift` to select as you jump. The selection grows from where the cursor was when you started, so you can go forward past your target and then back again without losing the start of the selection.

Add `Alt` to ignore case.

## Commands and keybindings

All commands are also in the Command Palette under **Scotty**.

| Command | Keybinding |
| --- | --- |
| Scotty: Jump Forward | `Ctrl+0` |
| Scotty: Jump Backward | `Ctrl+7` |
| Scotty: Select Forward | `Ctrl+Shift+0` |
| Scotty: Select Backward | `Ctrl+Shift+7` |
| Scotty: Jump Forward (Case-Insensitive) | `Ctrl+Alt+0` |
| Scotty: Jump Backward (Case-Insensitive) | `Ctrl+Alt+7` |
| Scotty: Select Forward (Case-Insensitive) | `Ctrl+Alt+Shift+0` |
| Scotty: Select Backward (Case-Insensitive) | `Ctrl+Alt+Shift+7` |

`Ctrl` is used on macOS too, so these don't clash with `Cmd+0`.

To use different keys, open **Preferences: Open Keyboard Shortcuts** and search for `scotty`.

## Jump straight to specific characters

Every command takes an optional argument: the characters to jump to. A keybinding with `args` skips the prompt. For example, to jump to the next `(` with `Ctrl+9`, add this to your `keybindings.json`:

```jsonc
{
  "key": "ctrl+9",
  "command": "scotty.jumpForward",
  "args": "(",
  "when": "editorTextFocus"
}
```

After a jump like this, the regular repeat keys keep jumping to `(`.

## License

[MIT](LICENSE)
