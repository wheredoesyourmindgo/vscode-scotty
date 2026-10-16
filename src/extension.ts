import * as vscode from 'vscode'

type Direction = 'forward' | 'backward'

interface JumpState {
  text: string
  caseInsensitive: boolean
  // Where the last jump landed; repeating only works while the cursor is still here
  position: vscode.Position
  document: vscode.TextDocument
}

const STATUS_MESSAGE_TIMEOUT_MS = 3000

export function activate(context: vscode.ExtensionContext) {
  let state: JumpState | undefined

  const isRepeatable = (editor: vscode.TextEditor) =>
    state !== undefined &&
    state.document === editor.document &&
    editor.selection.active.isEqual(state.position)

  context.subscriptions.push(
    // Moving the cursor anywhere other than the last jump target ends the repeat
    vscode.window.onDidChangeTextEditorSelection((event) => {
      if (state && !isRepeatable(event.textEditor)) {
        state = undefined
      }
    }),
    vscode.workspace.onDidChangeTextDocument((event) => {
      if (state && event.document === state.document) {
        state = undefined
      }
    }),
    vscode.window.onDidChangeActiveTextEditor(() => {
      state = undefined
    })
  )

  const jump = (
    editor: vscode.TextEditor,
    text: string,
    direction: Direction,
    select: boolean,
    caseInsensitive: boolean
  ) => {
    const document = editor.document
    const active = editor.selection.active
    const index = findOccurrence(
      document.getText(),
      text,
      document.offsetAt(active),
      direction,
      caseInsensitive
    )

    if (index === -1) {
      vscode.window.setStatusBarMessage(
        `Scotty: "${text}" not found`,
        STATUS_MESSAGE_TIMEOUT_MS
      )
      return
    }

    const target = document.positionAt(index)
    // When selecting, keep the anchor where the selection started
    const anchor = select ? editor.selection.anchor : target
    editor.selection = new vscode.Selection(anchor, target)
    editor.revealRange(new vscode.Range(target, target))

    state = {text, caseInsensitive, position: target, document}
  }

  const handleJumpCommand = async (
    direction: Direction,
    select: boolean,
    caseInsensitive: boolean,
    text?: unknown
  ) => {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      return
    }

    // Text passed as a command argument (e.g. from a keybinding) jumps directly
    if (typeof text === 'string' && text.length > 0) {
      jump(editor, text, direction, select, caseInsensitive)
      return
    }

    // Repeat the last jump, keeping its text and case sensitivity
    if (state && isRepeatable(editor)) {
      jump(editor, state.text, direction, select, state.caseInsensitive)
      return
    }

    const input = await vscode.window.showInputBox({
      prompt:
        direction === 'forward'
          ? 'Type characters to jump to'
          : 'Type characters to jump back to',
      ignoreFocusOut: true
    })

    // The user may have switched editors while the input box was open
    if (input && vscode.window.activeTextEditor === editor) {
      jump(editor, input, direction, select, caseInsensitive)
    }
  }

  const commands: [string, Direction, boolean, boolean][] = [
    ['scotty.jumpForward', 'forward', false, false],
    ['scotty.jumpBackward', 'backward', false, false],
    ['scotty.selectForward', 'forward', true, false],
    ['scotty.selectBackward', 'backward', true, false],
    ['scotty.jumpForwardCaseInsensitive', 'forward', false, true],
    ['scotty.jumpBackwardCaseInsensitive', 'backward', false, true],
    ['scotty.selectForwardCaseInsensitive', 'forward', true, true],
    ['scotty.selectBackwardCaseInsensitive', 'backward', true, true]
  ]

  for (const [id, direction, select, caseInsensitive] of commands) {
    context.subscriptions.push(
      vscode.commands.registerCommand(id, (text?: unknown) =>
        handleJumpCommand(direction, select, caseInsensitive, text)
      )
    )
  }
}

/**
 * Returns the offset of the next (forward) or previous (backward) occurrence
 * of `text` relative to `offset`, or -1 if there is none. A match at `offset`
 * itself is skipped so repeated jumps move past the current target.
 */
export function findOccurrence(
  haystack: string,
  text: string,
  offset: number,
  direction: Direction,
  caseInsensitive: boolean
): number {
  if (!caseInsensitive) {
    return direction === 'forward'
      ? haystack.indexOf(text, offset + 1)
      : offset > 0
        ? haystack.lastIndexOf(text, offset - 1)
        : -1
  }

  // A case-insensitive regex keeps offsets intact, unlike toLowerCase(), which
  // can change string length for some characters
  const pattern = new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')

  if (direction === 'forward') {
    pattern.lastIndex = offset + 1
    return pattern.exec(haystack)?.index ?? -1
  }

  let last = -1
  let match: RegExpExecArray | null
  while ((match = pattern.exec(haystack)) && match.index < offset) {
    last = match.index
    // Step one character at a time so overlapping matches are found
    pattern.lastIndex = match.index + 1
  }
  return last
}

export function deactivate() {}
