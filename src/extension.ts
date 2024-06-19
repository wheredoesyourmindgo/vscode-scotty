import * as vscode from 'vscode'

export function activate(context: vscode.ExtensionContext) {
  let jumpToChar: string | undefined
  let lastJumpPosition: vscode.Position | undefined
  let autoJumpEnabled: boolean = false
  let shouldSelect: boolean = false

  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left
  )
  statusBarItem.show()

  const resetAutoJump = () => {
    autoJumpEnabled = false
    lastJumpPosition = undefined
    statusBarItem.text = ''
  }

  vscode.window.onDidChangeTextEditorSelection(() => {
    if (!autoJumpEnabled) {
      resetAutoJump()
    }
  })

  vscode.workspace.onDidChangeTextDocument(() => {
    resetAutoJump()
  })

  vscode.window.onDidChangeActiveTextEditor(() => {
    resetAutoJump()
  })

  const captureNextChar = (
    direction: 'forward' | 'backward',
    select: boolean
  ) => {
    shouldSelect = select
    statusBarItem.text =
      direction === 'forward'
        ? 'Type character to jump to'
        : 'Type character to jump back to'

    vscode.window
      .showInputBox({
        prompt: statusBarItem.text,
        ignoreFocusOut: true,
        // validateInput: (text) =>
        //   text.length === 1 ? null : 'Please type a single character'
      })
      .then((char) => {
        if (char && char.length === 1) {
          const editor = vscode.window.activeTextEditor
          if (editor) {
            const document = editor.document
            const position = editor.selection.active
            jumpToChar = char

            if (direction === 'forward') {
              jumpToNextOccurrence(
                document,
                position,
                jumpToChar,
                'next',
                shouldSelect
              )
            } else if (direction === 'backward') {
              jumpToNextOccurrence(
                document,
                position,
                jumpToChar,
                'previous',
                shouldSelect
              )
            }

            statusBarItem.text = ''
            autoJumpEnabled = true
          }
        } else {
          resetAutoJump()
        }
      })
  }

  const jumpToNextOccurrence = (
    document: vscode.TextDocument,
    position: vscode.Position,
    char: string,
    type: 'next' | 'previous',
    select: boolean
  ) => {
    const text = document.getText()
    let index: number

    if (type === 'next') {
      index = text.indexOf(char, document.offsetAt(position) + 1)
    } else {
      index = text.lastIndexOf(char, document.offsetAt(position) - 1)
    }

    if (index !== -1) {
      const newPosition = document.positionAt(index)
      const editor = vscode.window.activeTextEditor
      if (editor) {
        if (select) {
          const selection = new vscode.Selection(position, newPosition)
          editor.selection = selection
        } else {
          editor.selection = new vscode.Selection(newPosition, newPosition)
        }
        vscode.window.setStatusBarMessage(`Jumped to ${type} "${char}"`)
        lastJumpPosition = newPosition
      }
    }
  }

  const handleJumpCommand = (
    direction: 'forward' | 'backward',
    select: boolean
  ) => {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      return
    }

    const document = editor.document
    const position = editor.selection.active

    if (
      autoJumpEnabled &&
      lastJumpPosition &&
      position.isEqual(lastJumpPosition)
    ) {
      if (direction === 'forward' && jumpToChar) {
        jumpToNextOccurrence(document, position, jumpToChar, 'next', select)
      } else if (direction === 'backward' && jumpToChar) {
        jumpToNextOccurrence(document, position, jumpToChar, 'previous', select)
      }
    } else {
      captureNextChar(direction, select)
    }
  }

  let jumpForward = vscode.commands.registerCommand(
    'scotty.jumpForward',
    () => {
      handleJumpCommand('forward', false)
    }
  )

  let jumpBackward = vscode.commands.registerCommand(
    'scotty.jumpBackward',
    () => {
      handleJumpCommand('backward', false)
    }
  )

  let selectForward = vscode.commands.registerCommand(
    'scotty.selectForward',
    () => {
      handleJumpCommand('forward', true)
    }
  )

  let selectBackward = vscode.commands.registerCommand(
    'scotty.selectBackward',
    () => {
      handleJumpCommand('backward', true)
    }
  )

  context.subscriptions.push(jumpForward)
  context.subscriptions.push(jumpBackward)
  context.subscriptions.push(selectForward)
  context.subscriptions.push(selectBackward)
  context.subscriptions.push(statusBarItem)
}

export function deactivate() {}
