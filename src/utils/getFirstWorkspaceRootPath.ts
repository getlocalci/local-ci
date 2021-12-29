import * as vscode from 'vscode';

// Gets the absolute path to this VS Code workspace.
// @todo: handle multiple workspaceFolders.
// Only gets the 1st workspaceFolder,
// though there could be several.
export default function getFirstWorkspaceRootPath(): string {
  return vscode.workspace?.workspaceFolders?.length
    ? vscode.workspace.workspaceFolders[0]?.uri?.path
    : '';
}
