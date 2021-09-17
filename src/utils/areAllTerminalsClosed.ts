import * as vscode from 'vscode';

export default function areAllTerminalsClosed(
  ...terminals: (vscode.Terminal | undefined)[]
): boolean {
  return terminals.every(
    (terminal) => !terminal || Boolean(terminal?.exitStatus)
  );
}
