import type vscode from 'vscode';

export default function areTerminalsClosed(
  ...terminals: (vscode.Terminal | undefined)[]
): boolean {
  return terminals.every((terminal) => !terminal || !!terminal?.exitStatus);
}
