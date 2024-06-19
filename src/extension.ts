import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  let forwardChar: string | undefined;
  let backwardChar: string | undefined;
  let lastJumpPosition: vscode.Position | undefined;
  let autoJumpEnabled: boolean = false;
  let shouldSelect: boolean = false;
  let waitingForChar: boolean = false;

  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
  statusBarItem.show();

  const resetAutoJump = () => {
    autoJumpEnabled = false;
    lastJumpPosition = undefined;
    statusBarItem.text = '';
  };

  const captureNextChar = (direction: 'forward' | 'backward', select: boolean) => {
    waitingForChar = true;
    shouldSelect = select;
    statusBarItem.text = direction === 'forward' ? 'Type character to jump to' : 'Type character to jump back to';

    const disposable = vscode.window.onDidChangeTextEditorSelection(async (e) => {
      if (!waitingForChar) {
        disposable.dispose();
        return;
      }

      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const document = editor.document;
        const position = editor.selection.active;

        const charRange = new vscode.Range(position.translate(0, -1), position);
        const char = document.getText(charRange);

        if (char && char.length === 1) {
          if (direction === 'forward') {
            forwardChar = char;
            jumpToNextOccurrence(document, position, forwardChar, 'next', shouldSelect);
          } else if (direction === 'backward') {
            backwardChar = char;
            jumpToNextOccurrence(document, position, backwardChar, 'previous', shouldSelect);
          }

          await editor.edit(editBuilder => {
            editBuilder.delete(charRange);
          });

          statusBarItem.text = '';
          waitingForChar = false;
          autoJumpEnabled = true;
          disposable.dispose();
        }
      }
    });

    context.subscriptions.push(disposable);
  };

  const jumpToNextOccurrence = (document: vscode.TextDocument, position: vscode.Position, char: string, type: 'next' | 'previous', select: boolean) => {
    const text = document.getText();
    let index: number;

    if (type === 'next') {
      index = text.indexOf(char, document.offsetAt(position) + 1);
    } else {
      index = text.lastIndexOf(char, document.offsetAt(position) - 1);
    }

    if (index !== -1) {
      const newPosition = document.positionAt(index);
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        if (select) {
          const selection = new vscode.Selection(position, newPosition);
          editor.selection = selection;
        } else {
          editor.selection = new vscode.Selection(newPosition, newPosition);
        }
        vscode.window.setStatusBarMessage(`Jumped to ${type} "${char}"`);
        lastJumpPosition = newPosition;
      }
    }
  };

  const handleJumpCommand = (direction: 'forward' | 'backward', select: boolean) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const document = editor.document;
    const position = editor.selection.active;

    if (autoJumpEnabled && lastJumpPosition && position.isEqual(lastJumpPosition)) {
      if (direction === 'forward' && forwardChar) {
        jumpToNextOccurrence(document, position, forwardChar, 'next', select);
      } else if (direction === 'backward' && backwardChar) {
        jumpToNextOccurrence(document, position, backwardChar, 'previous', select);
      }
    } else {
      captureNextChar(direction, select);
    }
  };

  let jumpForward = vscode.commands.registerCommand('scotty.jumpForward', () => {
    handleJumpCommand('forward', false);
  });

  let jumpBackward = vscode.commands.registerCommand('scotty.jumpBackward', () => {
    handleJumpCommand('backward', false);
  });

  let selectForward = vscode.commands.registerCommand('scotty.selectForward', () => {
    handleJumpCommand('forward', true);
  });

  let selectBackward = vscode.commands.registerCommand('scotty.selectBackward', () => {
    handleJumpCommand('backward', true);
  });

  context.subscriptions.push(jumpForward);
  context.subscriptions.push(jumpBackward);
  context.subscriptions.push(selectForward);
  context.subscriptions.push(selectBackward);
  context.subscriptions.push(statusBarItem);
}

export function deactivate() {}
