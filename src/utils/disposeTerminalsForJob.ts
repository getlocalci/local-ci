import * as vscode from 'vscode';

export default function disposeTerminalsForJob(
  runningTerminals: RunningTerminals,
  jobName: string
): Promise<void[]> {
  return Promise.all(
    vscode.window.terminals.map(async (terminalCandidate) => {
      if (
        !!runningTerminals[jobName] &&
        runningTerminals[jobName].includes(await terminalCandidate.processId)
      ) {
        terminalCandidate.dispose();
      }
    })
  );
}
