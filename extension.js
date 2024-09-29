const vscode = require('vscode')

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
  const pythonExtension = vscode.extensions.getExtension('ms-python.python')
  if (!pythonExtension) {
    vscode.window.showErrorMessage('Python extension not found. Please install it.')
    return
  }
  if (!pythonExtension.isActive) {
    await pythonExtension.activate()
  }
  const pythonPath = await getPythonInterpreter()
  let disposable = vscode.commands.registerCommand('edulint.lint', function () {
    if (!pythonPath) {
      vscode.window.showErrorMessage('Python interpreter not found. Please configure Python in your workspace.')
      return
    }
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
    const activeEditor = vscode.window.activeTextEditor
    if (!activeEditor || activeEditor.document.languageId !== 'python') {
      vscode.window.showErrorMessage('Please run this command in a Python file (.py)')
      return
    }
    const filePath = activeEditor.document.uri.fsPath
    terminal.sendText(
      `${pythonPath} -m edulint check "${filePath}"`
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

async function getPythonInterpreter() {
  const pythonExtension = vscode.extensions.getExtension('ms-python.python')
  if (pythonExtension && pythonExtension.exports) {
    const pythonAPI = pythonExtension.exports
    const pythonPath = await pythonAPI.settings.getExecutionDetails()
    return pythonPath.execCommand[0] || null
  }
  return null
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
}
