import { iocContainer } from 'common/AppIoc';
import type vscode from 'vscode';
import LocalCi from 'common/LocalCi';

export function activate(context: vscode.ExtensionContext) {
  iocContainer.get(LocalCi).activate(context);
}

export function deactivate() {
  iocContainer.get(LocalCi).deactivate();
}
