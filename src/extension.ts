import { app } from 'CompositionRoot';
import type vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  app.activate(context);
}

export function deactivate() {
  app.deactivate();
}
