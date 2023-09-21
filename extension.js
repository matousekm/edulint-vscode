const vscode = require('vscode')

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  let disposable = vscode.commands.registerCommand('edulint.lint', function () {
    // check for already existing terminals
    const terminalMatchIndex = vscode.window.terminals.findIndex(
      (terminal) => terminal.name === 'edulint terminal'
    )
    let terminal
    if (terminalMatchIndex === -1) {
      terminal = vscode.window.createTerminal('edulint terminal')
    } else {
      terminal = vscode.window.terminals[terminalMatchIndex]
    }
    terminal.show()

    if (vscode.window.activeTextEditor.document.uri.path.slice(-3) !== '.py') {
      vscode.window.showErrorMessage('Please run this command in a .py file')
    }

    terminal.sendText(
      `python3 -m edulint ${vscode.window.activeTextEditor.document.uri.path}`
    )
  })

  context.subscriptions.push(disposable)

  const button = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right
  )
  button.text = '$(eye) EduLint' // You can customize the text and icon
  button.tooltip = 'Run EduLint'
  button.command = 'edulint.lint' // The command defined in package.json
  button.show()

  context.subscriptions.push(button)
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
}
