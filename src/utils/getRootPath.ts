import * as vscode from 'vscode';

/** Gets the absolute path to this VS Code workspace. */
export default function getRootPath(): string {
  return vscode.workspace?.workspaceFolders?.length
    ? vscode.workspace.workspaceFolders[0]?.uri?.path
    : '';
}
