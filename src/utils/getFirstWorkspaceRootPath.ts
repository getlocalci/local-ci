import * as vscode from 'vscode';

/**
 * Gets the absolute path to the 1st VS Code workspace folder.
 *
 * Though there could be several workspace folders.
 */
export default function getFirstWorkspaceRootPath(): string {
  return vscode.workspace?.workspaceFolders?.length
    ? vscode.workspace.workspaceFolders[0]?.uri?.path
    : '';
}
