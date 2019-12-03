import * as vscode from 'vscode';

import { exec } from 'child_process';

export function activate(context: vscode.ExtensionContext) {
	const disposableWholeFile = vscode.commands.registerCommand('extension.pipefileinto', () => {
		const { activeTextEditor } = vscode.window;

		if (activeTextEditor !== undefined) {

			vscode.window.showInputBox({
				placeHolder: 'printf $TXT',
				value: 'printf $TXT | ',
				prompt: 'Commandline Code',
			}).then(command => {

				const text = activeTextEditor.document.getText();

				if (command !== undefined) {
					const commandString = command.replace('$TXT', `"${text}"`);

					exec(commandString, (error, stdout, stderr) => {
						if (error) {
							const errorString = `Command failed with exit code ${error.code}, (${error.message})\n${stderr}`;
							vscode.window.showErrorMessage(errorString);
							return;
						}

						activeTextEditor.edit(editBuilder => {
							const firstLine = activeTextEditor.document.lineAt(0);
							const lastLine = activeTextEditor.document.lineAt(activeTextEditor.document.lineCount - 1);

							const textRange = new vscode.Range(0,
								firstLine.range.start.character,
								activeTextEditor.document.lineCount - 1,
								lastLine.range.end.character);

							editBuilder.replace(textRange, stdout);
						});
					});
				}

			});
		}
	});

	const disposableSelection = vscode.commands.registerCommand('extension.pipeselectioninto', () => {
		const { activeTextEditor } = vscode.window;

		if (activeTextEditor !== undefined) {

			vscode.window.showInputBox({
				placeHolder: 'printf $TXT',
				value: 'printf $TXT | ',
				prompt: 'Commandline Code',
			}).then(command => {

				if (command === undefined || command.trim() === '') {
					return;
				}

				const { selections } = activeTextEditor;

				selections.forEach(selection => {
					const text = activeTextEditor.document.getText(selection);

					const commandString = command.replace('$TXT', `"${text}"`);

					exec(commandString, (error, stdout, stderr) => {
						if (error) {
							const errorString = `Command failed with exit code ${error.code} (${error.message})\n\n${stderr}`;
							vscode.window.showErrorMessage(errorString);
							return;
						}

						activeTextEditor.edit(editBuilder => {
							editBuilder.replace(selection, stdout);
						});
					});
				});
			});
		}
	});

	context.subscriptions.push(disposableWholeFile, disposableSelection);
}

export function deactivate() { }
