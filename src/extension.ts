// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
const { quicksql } = require( "@oracle/quicksql" );

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "quick-sql" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('quick-sql.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Quick SQL!');
	});


	context.subscriptions.push(disposable);


	const myScheme = 'qsql';
	const myProvider = new class implements vscode.TextDocumentContentProvider {

		// emitter and its event
		onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
		onDidChange = this.onDidChangeEmitter.event;

		provideTextDocumentContent(uri: vscode.Uri): string {
			// simply invoke cowsay, use uri-path as text
			return "hi";
		}
	};
	context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(myScheme, myProvider));


	context.subscriptions.push(vscode.commands.registerCommand('quicksql.toSQL', async () => {
		if (!vscode.window.activeTextEditor) {
			return; // no editor
		}
		const { document } = vscode.window.activeTextEditor;
		
		// get path-components, reverse it, and create a new uri
		const path = document.uri.path;
		const newFile = document.uri.with({ path: path + ".quick.sql"});
		const text = document.getText();


		const editor = getEditor(newFile);

		const sql = quicksql.toDDL(document.getText());

	    if (editor) {
			editor.edit(edit => {
				edit.replace(new vscode.Range(0, 0, document.lineCount, 0), sql);
			});
		} else {			
			await vscode.window.showTextDocument(newFile, { preview: false }).then(e => {
				e.edit(edit => {
					edit.replace(new vscode.Range(0, 0, document.lineCount, 0), sql);
				});
			});
		}

	}));


}

function isOpen(uri: vscode.Uri) {
	for (const tabGroup of vscode.window.tabGroups.all) {
		for (const tab of tabGroup.tabs) {
			if (tab.input instanceof vscode.TabInputText) {
				if ( tab.input.uri === uri ){
					return true; //console.info(tab.input.uri);
				}
			}
		}
	}
	return false;
}
function getEditor(newFile : vscode.Uri) {
	const editors = vscode.window.visibleTextEditors;

	for (const editor of editors) {
		if (editor.document.uri.path === newFile.path) {
			return editor;
		}
	}
	return null;
}
// This method is called when your extension is deactivated
export function deactivate() {}
