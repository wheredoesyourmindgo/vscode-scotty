import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  let forwardChar: string | undefined;
  let backwardChar: string | undefined;
  let waitingForChar: boolean = false;
  let direction: 'forward' | 'backward' | undefined;
  let shouldSelect: boolean = false;

  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
  statusBarItem.show();

  const captureNextChar = (direction: 'forward' | 'backward', select: boolean) => {
    waitingForChar = true;
    shouldSelect = select;
    statusBarItem.text = direction === 'forward' ? 'Jump to: ' : 'Jump back to: ';

    // Show an input box to capture the next character
    vscode.window.showInputBox({
      prompt: direction === 'forward' ? 'Jump to:' : 'Jump back to:',
      ignoreFocusOut: true,
      placeHolder: 'Type the character to jump to'
    }).then(char => {
      if (char && char.length === 1) {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
          const document = editor.document;
          const position = editor.selection.active;

          if (direction === 'forward') {
            forwardChar = char;
            jumpToNextOccurrence(document, position, forwardChar, 'next', shouldSelect);
          } else if (direction === 'backward') {
            backwardChar = char;
            jumpToNextOccurrence(document, position, backwardChar, 'previous', shouldSelect);
          }
        }
      }
      statusBarItem.text = '';
      waitingForChar = false;
    });
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
      }
    }
  };

  let jumpForward = vscode.commands.registerCommand('scotty.jumpForward', () => {
    captureNextChar('forward', false);
  });

  let jumpBackward = vscode.commands.registerCommand('scotty.jumpBackward', () => {
    captureNextChar('backward', false);
  });

  let selectForward = vscode.commands.registerCommand('scotty.selectForward', () => {
    captureNextChar('forward', true);
  });

  let selectBackward = vscode.commands.registerCommand('scotty.selectBackward', () => {
    captureNextChar('backward', true);
  });

  context.subscriptions.push(jumpForward);
  context.subscriptions.push(jumpBackward);
  context.subscriptions.push(selectForward);
  context.subscriptions.push(selectBackward);
  context.subscriptions.push(statusBarItem);
}

export function deactivate() {}
