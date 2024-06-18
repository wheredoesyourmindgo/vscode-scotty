import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  let forwardChar: string | undefined;
  let backwardChar: string | undefined;
  let waitingForChar: boolean = false;
  let direction: 'forward' | 'backward' | undefined;
  let shouldSelect: boolean = false;

  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
  statusBarItem.show();

  vscode.window.onDidChangeTextEditorSelection((e) => {
    if (waitingForChar && e.selections.length > 0) {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const document = editor.document;
        const selection = editor.selection;
        const position = selection.active;
        const char = document.getText(new vscode.Range(position, new vscode.Position(position.line, position.character + 1)));

        if (char.length === 1) {
          if (direction === 'forward') {
            forwardChar = char;
            jumpToNextOccurrence(document, position, forwardChar, 'next', shouldSelect);
          } else if (direction === 'backward') {
            backwardChar = char;
            jumpToNextOccurrence(document, position, backwardChar, 'previous', shouldSelect);
          }
          statusBarItem.text = '';
          waitingForChar = false;
          direction = undefined;
          shouldSelect = false;
        }
      }
    }
  });

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
    statusBarItem.text = 'Jump to: ';
  });

  let jumpBackward = vscode.commands.registerCommand('scotty.jumpBackward', () => {
    waitingForChar = true;
    direction = 'backward';
    shouldSelect = false;
    statusBarItem.text = 'Jump back to: ';
  });

  let selectForward = vscode.commands.registerCommand('scotty.selectForward', () => {
    waitingForChar = true;
    direction = 'forward';
    shouldSelect = true;
    statusBarItem.text = 'Select to: ';
  });

  let selectBackward = vscode.commands.registerCommand('scotty.selectBackward', () => {
    waitingForChar = true;
    direction = 'backward';
    shouldSelect = true;
    statusBarItem.text = 'Select back to: ';
  });

  context.subscriptions.push(jumpForward);
  context.subscriptions.push(jumpBackward);
  context.subscriptions.push(selectForward);
  context.subscriptions.push(selectBackward);
  context.subscriptions.push(statusBarItem);
}

export function deactivate() {}
