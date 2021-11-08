import * as vscode from 'vscode';
import getTerminalName from './getTerminalName';
import getDebuggingTerminalName from './getDebuggingTerminalName';
import getFinalTerminalName from './getFinalTerminalName';

// Closes VS Code terminals for a job.
export default function disposeTerminalsForJob(jobName: string): void {
  const terminalNames = [
    getTerminalName(jobName),
    getDebuggingTerminalName(jobName),
    getFinalTerminalName(jobName),
  ];

  vscode.window.terminals.forEach((terminal) => {
    if (terminalNames.includes(terminal.name)) {
      terminal.dispose();
    }
  });
}
