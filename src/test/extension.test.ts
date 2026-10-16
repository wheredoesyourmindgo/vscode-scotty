import * as assert from 'assert'
import * as vscode from 'vscode'
import {findOccurrence} from '../extension'

suite('findOccurrence', () => {
  const text = 'foo Bar foo bar'

  test('finds the next occurrence after the offset', () => {
    assert.strictEqual(findOccurrence(text, 'foo', 0, 'forward', false), 8)
  })

  test('finds the previous occurrence before the offset', () => {
    assert.strictEqual(findOccurrence(text, 'foo', 8, 'backward', false), 0)
  })

  test('returns -1 when there is no occurrence', () => {
    assert.strictEqual(findOccurrence(text, 'foo', 8, 'forward', false), -1)
    assert.strictEqual(findOccurrence(text, 'foo', 0, 'backward', false), -1)
  })

  test('respects case unless case-insensitive', () => {
    assert.strictEqual(findOccurrence(text, 'bar', 0, 'forward', false), 12)
    assert.strictEqual(findOccurrence(text, 'bar', 0, 'forward', true), 4)
    assert.strictEqual(findOccurrence(text, 'BAR', 15, 'backward', true), 12)
  })

  test('treats regex characters literally when case-insensitive', () => {
    assert.strictEqual(findOccurrence('a.b a*b', '*', 0, 'forward', true), 5)
  })

  test('finds overlapping matches backward when case-insensitive', () => {
    assert.strictEqual(findOccurrence('aaaa', 'AA', 3, 'backward', true), 2)
  })
})

suite('Scotty commands', () => {
  let editor: vscode.TextEditor

  const setCursor = (offset: number) => {
    const position = editor.document.positionAt(offset)
    editor.selection = new vscode.Selection(position, position)
  }

  const offsets = () => ({
    anchor: editor.document.offsetAt(editor.selection.anchor),
    active: editor.document.offsetAt(editor.selection.active)
  })

  setup(async () => {
    const document = await vscode.workspace.openTextDocument({
      content: 'one (two) three (four) Five five'
    })
    editor = await vscode.window.showTextDocument(document)
    setCursor(0)
  })

  teardown(async () => {
    await vscode.commands.executeCommand(
      'workbench.action.revertAndCloseActiveEditor'
    )
  })

  test('jumps forward to text passed as an argument', async () => {
    await vscode.commands.executeCommand('scotty.jumpForward', '(')
    assert.deepStrictEqual(offsets(), {anchor: 4, active: 4})
  })

  test('repeats the last jump without prompting', async () => {
    await vscode.commands.executeCommand('scotty.jumpForward', '(')
    await vscode.commands.executeCommand('scotty.jumpForward')
    assert.deepStrictEqual(offsets(), {anchor: 16, active: 16})

    await vscode.commands.executeCommand('scotty.jumpBackward')
    assert.deepStrictEqual(offsets(), {anchor: 4, active: 4})
  })

  test('select keeps the original anchor when changing direction', async () => {
    setCursor(2)
    await vscode.commands.executeCommand('scotty.selectForward', '(')
    await vscode.commands.executeCommand('scotty.selectForward')
    assert.deepStrictEqual(offsets(), {anchor: 2, active: 16})

    await vscode.commands.executeCommand('scotty.selectBackward')
    assert.deepStrictEqual(offsets(), {anchor: 2, active: 4})
  })

  test('case-insensitive jump matches either case', async () => {
    await vscode.commands.executeCommand('scotty.jumpForward', 'five')
    assert.deepStrictEqual(offsets(), {anchor: 28, active: 28})

    setCursor(0)
    await vscode.commands.executeCommand(
      'scotty.jumpForwardCaseInsensitive',
      'five'
    )
    assert.deepStrictEqual(offsets(), {anchor: 23, active: 23})
  })

  test('leaves the cursor alone when the text is not found', async () => {
    setCursor(3)
    await vscode.commands.executeCommand('scotty.jumpForward', 'zzz')
    assert.deepStrictEqual(offsets(), {anchor: 3, active: 3})
  })
})
