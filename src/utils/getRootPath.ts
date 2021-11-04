import * as vscode from 'vscode';

// Gets the absolute path to this VS Code workspace.
// @todo: handle multiple workspaceFolders.
export default function getRootPath(): string {
  return vscode.workspace?.workspaceFolders?.length
    ? vscode.workspace.workspaceFolders[0]?.uri?.path
    : '';
}
