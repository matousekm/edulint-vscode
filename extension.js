const vscode = require('vscode')
const { promisify } = require('util')
const exec = promisify(require('child_process').exec)

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

  let diagnosticCollection = vscode.languages.createDiagnosticCollection('edulint')
  context.subscriptions.push(diagnosticCollection)

  // Listen to active text editor changes and update diagnostics
  if (vscode.window.activeTextEditor) {
		updateDiagnosticCollection(vscode.window.activeTextEditor.document, diagnosticCollection);
	}

	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor(editor => {
			if (editor) {
				updateDiagnosticCollection(editor.document, diagnosticCollection);
			}
		})
	);

  context.subscriptions.push(vscode.workspace.onDidSaveTextDocument((doc) => {
    updateDiagnosticCollection(doc, diagnosticCollection)
  }))

  context.subscriptions.push(vscode.workspace.onDidOpenTextDocument((doc) => {
    updateDiagnosticCollection(doc, diagnosticCollection)
  }))

  context.subscriptions.push(vscode.workspace.onDidCloseTextDocument((doc) => {
    diagnosticCollection.delete(doc.uri)
  }))
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

/**
 * @param {vscode.TextDocument} doc 
 * @param {vscode.DiagnosticCollection} diagCollection 
 */
async function updateDiagnosticCollection(doc, diagCollection) {
  if (doc.languageId !== 'python') {
    return
  }

  const diagnostics = []
  const outp = await getEdulintOutput(doc.fileName)
  const problems = outp.problems
  
  for (const problem of problems) {
    const diagnostic = {
      code: problem.code + (problem.symbol? `:${problem.symbol}` : ''),
      message: problem.text,
      range: new vscode.Range(
        problem.line - 1,
        problem.column,
        (problem.end_line || problem.line) - 1,
        problem.end_column || problem.column
      ),
      // ib111.toml reuses the enabled_by field to indicate the severity
      severity: problem.enabled_by === 'error' ? vscode.DiagnosticSeverity.Error : vscode.DiagnosticSeverity.Warning,
      source: 'edulint',
    }
    diagnostics.push(diagnostic)
  }

  diagCollection.set(doc.uri, diagnostics)
}

/**
 * @param {string} filePath 
 * @returns edulint's parsed json output
 */
async function getEdulintOutput(filePath) {
  const pythonPath = await getPythonInterpreter()
  if (!pythonPath) {
    vscode.window.showErrorMessage('Python interpreter not found. Please configure Python in your workspace.')
    return
  }

  let out = {}
  try {
    out = await exec(`${pythonPath} -m edulint check --json "${filePath}"`)
  } catch (err) {
    out.stdout = err.stdout
    out.stderr = err.stderr
  }
  
  return JSON.parse(out.stdout)
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
}
