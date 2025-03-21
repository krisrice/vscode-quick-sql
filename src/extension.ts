// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
const { quicksql } = require( "@oracle/quicksql" );

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

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
			// already open
			updateSQL(editor, sql);			
		} else {			
			// open new editor			
			await vscode.window.showTextDocument(newFile, { preview: false }).then(editor => {
				updateSQL(editor, sql);
			});
		}

		vscode.workspace.onDidChangeTextDocument((e) => {
				if ( vscode.window.activeTextEditor ) {
					const { document } = vscode.window.activeTextEditor;
					const path = document.uri.path;
					const newFile = document.uri.with({ path: path + ".quick.sql"});
					const sql = quicksql.toDDL(document.getText());
					const editor = getEditor(newFile);
					if (editor) {
						updateSQL(editor, sql);

					}
				}
			});

	}));


}

function updateSQL(editor: vscode.TextEditor, sql: any) {
	editor.edit(edit => {
		edit.replace(new vscode.Range(editor.document.lineAt(0).range.start, editor.document.lineAt(editor.document.lineCount - 1).range.end), sql);

	});
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
