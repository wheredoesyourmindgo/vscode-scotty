import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  let forwardChar: string | undefined;
  let backwardChar: string | undefined;
  let waitingForChar: boolean = false;
  let direction: 'forward' | 'backward' | undefined;
  let shouldSelect: boolean = false;

  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
  statusBarItem.show();

  const disposables: vscode.Disposable[] = [];

  const captureNextChar = (direction: 'forward' | 'backward', select: boolean) => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      statusBarItem.text = direction === 'forward' ? 'Jump to: ' : 'Jump back to: ';

      const disposable = vscode.window.onDidChangeTextEditorSelection(async () => {
        const document = editor.document;
        const position = editor.selection.active;
        const charRange = new vscode.Range(position, position.translate(0, 1));
        const char = document.getText(charRange);

        if (char.length === 1) {
          if (direction === 'forward') {
            forwardChar = char;
            jumpToNextOccurrence(document, position, forwardChar, 'next', select);
          } else if (direction === 'backward') {
            backwardChar = char;
            jumpToNextOccurrence(document, position, backwardChar, 'previous', select);
          }

          statusBarItem.text = '';
          waitingForChar = false;
          disposable.dispose();
        }
      });

      disposables.push(disposable);
    }
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
    waitingForChar = true;
    direction = 'forward';
    shouldSelect = false;
    captureNextChar('forward', false);
  });

  let jumpBackward = vscode.commands.registerCommand('scotty.jumpBackward', () => {
    waitingForChar = true;
    direction = 'backward';
    shouldSelect = false;
    captureNextChar('backward', false);
  });

  let selectForward = vscode.commands.registerCommand('scotty.selectForward', () => {
    waitingForChar = true;
    direction = 'forward';
    shouldSelect = true;
    captureNextChar('forward', true);
  });

  let selectBackward = vscode.commands.registerCommand('scotty.selectBackward', () => {
    waitingForChar = true;
    direction = 'backward';
    shouldSelect = true;
    captureNextChar('backward', true);
  });

  context.subscriptions.push(jumpForward);
  context.subscriptions.push(jumpBackward);
  context.subscriptions.push(selectForward);
  context.subscriptions.push(selectBackward);
  context.subscriptions.push(statusBarItem);
  context.subscriptions.push(...disposables);
}

export function deactivate() {}
