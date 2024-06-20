# Scotty

Scotty is a Visual Studio Code extension that allows you to quickly jump to and select specific characters or sequences of characters within your code. You can perform these jumps either case-sensitively or case-insensitively, and you have the option to select text as you jump.

## Features

- Jump forward or backward to a specific character or sequence of characters.
- Select text as you jump forward or backward.
- Perform jumps case-sensitively or case-insensitively.
- Easily reset the jump state by changing the selection, document, or active editor.

## Keybindings

| Command                                | Keybinding                | Description                                        |
|----------------------------------------|---------------------------|----------------------------------------------------|
| Scotty: Jump Forward                   | `cmd+0`                   | Jump forward to the next occurrence of a character |
| Scotty: Jump Backward                  | `cmd+7`                   | Jump backward to the previous occurrence of a character |
| Scotty: Select Forward                 | `cmd+shift+0`             | Select forward to the next occurrence of a character |
| Scotty: Select Backward                | `cmd+shift+7`             | Select backward to the previous occurrence of a character |
| Scotty: Jump Forward (Case-Insensitive)| `alt+cmd+0`               | Jump forward to the next occurrence of a character (case-insensitive) |
| Scotty: Jump Backward (Case-Insensitive)| `alt+cmd+7`              | Jump backward to the previous occurrence of a character (case-insensitive) |
| Scotty: Select Forward (Case-Insensitive)| `alt+cmd+shift+0`       | Select forward to the next occurrence of a character (case-insensitive) |
| Scotty: Select Backward (Case-Insensitive)| `alt+cmd+shift+7`      | Select backward to the previous occurrence of a character (case-insensitive) |

## Usage

1. **Jump Forward**:
   - Press `cmd+0` to jump forward to the next occurrence of a character or sequence of characters.
   - Enter the character(s) to jump to in the input box that appears.

2. **Jump Backward**:
   - Press `cmd+7` to jump backward to the previous occurrence of a character or sequence of characters.
   - Enter the character(s) to jump to in the input box that appears.

3. **Select Forward**:
   - Press `cmd+shift+0` to select forward to the next occurrence of a character or sequence of characters.
   - Enter the character(s) to jump to in the input box that appears.

4. **Select Backward**:
   - Press `cmd+shift+7` to select backward to the previous occurrence of a character or sequence of characters.
   - Enter the character(s) to jump to in the input box that appears.

5. **Case-Insensitive Jump and Select**:
   - Use the `alt` key with the above commands to perform case-insensitive jumps and selections.

## Installation

1. Download and install Visual Studio Code.
2. Clone or download this repository.
3. Open the repository folder in Visual Studio Code.
4. Press `F5` to open a new VSCode window with the extension loaded.
5. Use the provided keybindings to start jumping and selecting characters in your code.

## Development

To make changes to this extension:

1. Open the repository folder in Visual Studio Code.
2. Make your changes to the source files.
3. Press `F5` to test your changes in a new VSCode window.

## Release Notes

### 0.1.0

- Initial release of Scotty.
- Added support for jumping and selecting characters forward and backward.
- Added case-insensitive options for jumping and selecting.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue to discuss any changes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

