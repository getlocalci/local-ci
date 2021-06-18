import * as vscode from 'vscode';
import { LocalCiProvider } from './LocalCiProvider';

export function activate(context: vscode.ExtensionContext) {
	const actionsProvider = new LocalCiProvider(vscode.workspace);
	vscode.window.registerTreeDataProvider('ciJobs', actionsProvider);
	vscode.commands.registerCommand('ciJobs.refresh', () => actionsProvider.refresh());
	vscode.window.createTreeView('ciJobs', {
		treeDataProvider: actionsProvider,
	});

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "localci" is now active!');

	let disposable = vscode.commands.registerCommand('localci.welcome', () => {
		console.log('inside welcome!');
	});

	context.subscriptions.push(disposable);

	let runActionDisposable = vscode.commands.registerCommand('localci.runAction', ( jobName ) => {
		vscode.window.showInformationMessage('About to run an action');

		const command = 'all' === jobName
			? 'act'
			: `act -j ${ jobName }`;

		const terminal = (<any>vscode.window).createTerminal('localci test');
		terminal.sendText(`echo "Running the CircleCI job ${ jobName }"`);
		terminal.sendText(command);
		terminal.show();
	});

	context.subscriptions.push(runActionDisposable);
}

// called when your extension is deactivated
export function deactivate() {}
