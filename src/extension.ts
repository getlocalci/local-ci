import * as vscode from 'vscode';
import { LocalCiProvider } from './LocalCiProvider';
import { RUN_JOB_COMMAND } from './constants';
import { runJob } from './utils';

export function activate(context: vscode.ExtensionContext): void {
  const ciProvider = new LocalCiProvider();
  const treeViewId = 'localCi';
  vscode.window.registerTreeDataProvider(treeViewId, ciProvider);
  vscode.commands.registerCommand(`${treeViewId}.refresh`, () =>
    ciProvider.refresh()
  );
  vscode.window.createTreeView(treeViewId, {
    treeDataProvider: ciProvider,
  });

  const runActionDisposable = vscode.commands.registerCommand(
    RUN_JOB_COMMAND,
    runJob
  );

  context.subscriptions.push(runActionDisposable);
}
