#!/bin/bash

# Package the extension
vsce package

# Find the latest .vsix file
VSIX_FILE=$(ls -t *.vsix | head -n 1)

# Install the extension in VS Code
code --install-extension $VSIX_FILE
