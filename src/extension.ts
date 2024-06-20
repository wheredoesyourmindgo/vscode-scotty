import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  let jumpToChar: string | undefined;
  let lastJumpPosition: vscode.Position | undefined;
  let autoJumpEnabled: boolean = false;
  let shouldSelect: boolean = false;
  let caseInsensitive: boolean = false;

  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
  statusBarItem.show();

  const resetAutoJump = () => {
    autoJumpEnabled = false;
    lastJumpPosition = undefined;
    jumpToChar = undefined;
    caseInsensitive = false;
    statusBarItem.text = '';
  };

  vscode.window.onDidChangeTextEditorSelection(() => {
    if (!autoJumpEnabled) {
      resetAutoJump();
    }
  });

  vscode.workspace.onDidChangeTextDocument(() => {
    resetAutoJump();
  });

  vscode.window.onDidChangeActiveTextEditor(() => {
    resetAutoJump();
  });

  const captureNextChar = (direction: 'forward' | 'backward', select: boolean, caseInsensitiveFlag: boolean) => {
    shouldSelect = select;
    caseInsensitive = caseInsensitiveFlag;
    statusBarItem.text = direction === 'forward' ? 'Type characters to jump to' : 'Type characters to jump back to';

    vscode.window
      .showInputBox({
        prompt: statusBarItem.text,
        ignoreFocusOut: true,
      })
      .then((char) => {
        if (char) {
          const editor = vscode.window.activeTextEditor;
          if (editor) {
            const document = editor.document;
            const position = editor.selection.active;
            jumpToChar = char;

            if (direction === 'forward') {
              jumpToNextOccurrence(document, position, jumpToChar, 'next', shouldSelect, caseInsensitive);
            } else if (direction === 'backward') {
              jumpToNextOccurrence(document, position, jumpToChar, 'previous', shouldSelect, caseInsensitive);
            }

            statusBarItem.text = '';
            autoJumpEnabled = true;
          }
        } else {
          resetAutoJump();
        }
      });
  };

  const jumpToNextOccurrence = (
    document: vscode.TextDocument,
    position: vscode.Position,
    char: string,
    type: 'next' | 'previous',
    select: boolean,
    caseInsensitive: boolean
  ) => {
    const text = document.getText();
    let index: number;
    const searchText = caseInsensitive ? text.toLowerCase() : text;
    const searchChar = caseInsensitive ? char.toLowerCase() : char;

    if (type === 'next') {
      index = searchText.indexOf(searchChar, document.offsetAt(position) + 1);
    } else {
      index = searchText.lastIndexOf(searchChar, document.offsetAt(position) - 1);
    }

    if (index !== -1) {
      const newPosition = document.positionAt(index);
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        if (select) {
          const currentSelection = editor.selection;
          let newSelection;
          if (type === 'next') {
            newSelection = new vscode.Selection(currentSelection.start, newPosition);
          } else {
            newSelection = new vscode.Selection(currentSelection.end, newPosition);
          }
          editor.selection = newSelection;
        } else {
          editor.selection = new vscode.Selection(newPosition, newPosition);
        }
        vscode.window.setStatusBarMessage(`Jumped to ${type} "${char}"`);
        lastJumpPosition = newPosition;
      }
    } else {
      vscode.window.setStatusBarMessage(`Character "${char}" not found`);
    }
  };

  const handleJumpCommand = (direction: 'forward' | 'backward', select: boolean, caseInsensitiveFlag: boolean) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const document = editor.document;
    const position = editor.selection.active;

    if (autoJumpEnabled && lastJumpPosition && position.isEqual(lastJumpPosition)) {
      if (direction === 'forward' && jumpToChar) {
        jumpToNextOccurrence(document, position, jumpToChar, 'next', select, caseInsensitive);
      } else if (direction === 'backward' && jumpToChar) {
        jumpToNextOccurrence(document, position, jumpToChar, 'previous', select, caseInsensitive);
      }
    } else {
      captureNextChar(direction, select, caseInsensitiveFlag);
    }
  };

  let jumpForward = vscode.commands.registerCommand('scotty.jumpForward', () => {
    handleJumpCommand('forward', false, false);
  });

  let jumpBackward = vscode.commands.registerCommand('scotty.jumpBackward', () => {
    handleJumpCommand('backward', false, false);
  });

  let selectForward = vscode.commands.registerCommand('scotty.selectForward', () => {
    handleJumpCommand('forward', true, false);
  });

  let selectBackward = vscode.commands.registerCommand('scotty.selectBackward', () => {
    handleJumpCommand('backward', true, false);
  });

  let jumpForwardCaseInsensitive = vscode.commands.registerCommand('scotty.jumpForwardCaseInsensitive', () => {
    handleJumpCommand('forward', false, true);
  });

  let jumpBackwardCaseInsensitive = vscode.commands.registerCommand('scotty.jumpBackwardCaseInsensitive', () => {
    handleJumpCommand('backward', false, true);
  });

  let selectForwardCaseInsensitive = vscode.commands.registerCommand('scotty.selectForwardCaseInsensitive', () => {
    handleJumpCommand('forward', true, true);
  });

  let selectBackwardCaseInsensitive = vscode.commands.registerCommand('scotty.selectBackwardCaseInsensitive', () => {
    handleJumpCommand('backward', true, true);
  });

  context.subscriptions.push(jumpForward);
  context.subscriptions.push(jumpBackward);
  context.subscriptions.push(selectForward);
  context.subscriptions.push(selectBackward);
  context.subscriptions.push(jumpForwardCaseInsensitive);
  context.subscriptions.push(jumpBackwardCaseInsensitive);
  context.subscriptions.push(selectForwardCaseInsensitive);
  context.subscriptions.push(selectBackwardCaseInsensitive);
  context.subscriptions.push(statusBarItem);
}

export function deactivate() {}
