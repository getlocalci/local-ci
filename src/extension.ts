import { localCi } from 'common/AppRoot';
import type vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  localCi.activate(context);
}

export function deactivate() {
  localCi.deactivate();
}
