import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  let forwardChar: string | undefined;
  let backwardChar: string | undefined;

  let jumpForward = vscode.commands.registerCommand('scotty.jumpForward', async () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const document = editor.document;
      const selection = editor.selection;
      const position = selection.active;

      if (forwardChar) {
        const text = document.getText();
        const nextIndex = text.indexOf(forwardChar, document.offsetAt(position) + 1);
        if (nextIndex !== -1) {
          const newPosition = document.positionAt(nextIndex);
          editor.selection = new vscode.Selection(newPosition, newPosition);
          vscode.window.setStatusBarMessage(`Jumped to next "${forwardChar}"`);
          return;
        }
      }

      forwardChar = await vscode.window.showInputBox({
        prompt: 'Enter character to jump to'
      });

      if (forwardChar) {
        vscode.window.setStatusBarMessage(`Set jump character to "${forwardChar}"`);
      }
    }
  });

  let jumpBackward = vscode.commands.registerCommand('scotty.jumpBackward', async () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const document = editor.document;
      const selection = editor.selection;
      const position = selection.active;

      if (backwardChar) {
        const text = document.getText();
        const prevIndex = text.lastIndexOf(backwardChar, document.offsetAt(position) - 1);
        if (prevIndex !== -1) {
          const newPosition = document.positionAt(prevIndex);
          editor.selection = new vscode.Selection(newPosition, newPosition);
          vscode.window.setStatusBarMessage(`Jumped to previous "${backwardChar}"`);
          return;
        }
      }

      backwardChar = await vscode.window.showInputBox({
        prompt: 'Enter character to jump to'
      });

      if (backwardChar) {
        vscode.window.setStatusBarMessage(`Set jump character to "${backwardChar}"`);
      }
    }
  });

  context.subscriptions.push(jumpForward);
  context.subscriptions.push(jumpBackward);
}

export function deactivate() {}

