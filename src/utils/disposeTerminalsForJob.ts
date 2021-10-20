import * as vscode from 'vscode';
import getTerminalName from './getTerminalName';
import getDebuggingTerminalName from './getDebuggingTerminalName';
import getFinalTerminalName from './getFinalTerminalName';

export default function disposeTerminalsForJob(jobName: string): void {
  const terminalNames = [
    getTerminalName(jobName),
    getDebuggingTerminalName(jobName),
    getFinalTerminalName(jobName),
  ];

  vscode.window.terminals.forEach((terminalCandidate) => {
    if (terminalNames.includes(terminalCandidate.name)) {
      terminalCandidate.dispose();
    }
  });
}
