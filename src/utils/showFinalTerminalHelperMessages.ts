import * as cp from 'child_process';
import * as vscode from 'vscode';
import getSpawnOptions from './getSpawnOptions';

export default function showFinalTerminalHelperMessages(
  finalTerminalContainerId: string
): void {
  const trivialMessages = [
    '_XSERVTransmkdir',
    'Server is already active for display',
  ];

  const { stdout } = cp.spawn(
    '/bin/sh',
    ['-c', `docker logs --follow ${finalTerminalContainerId}`],
    getSpawnOptions()
  );

  stdout.on('data', (data) => {
    if (!data?.toString) {
      return;
    }

    if (trivialMessages.some((message) => data.toString().includes(message))) {
      vscode.window.showInformationMessage(
        `👈 If you click return in the terminal, you should be able to debug this`
      );
    }
  });
}