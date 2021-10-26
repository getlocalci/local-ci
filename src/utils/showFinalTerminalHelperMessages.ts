import * as cp from 'child_process';
import * as vscode from 'vscode';
import { GET_FINAL_DEBUGGER_CONTAINER_FUNCTION } from '../constants';
import getSpawnOptions from './getSpawnOptions';

export default function showFinalTerminalHelperMessages(
  imageName: string
): void {
  const trivialMessages = [
    '_XSERVTransmkdir',
    'Server is already active for display',
  ];

  const { stdout } = cp.spawn(
    '/bin/sh',
    [
      '-c',
      `${GET_FINAL_DEBUGGER_CONTAINER_FUNCTION}
      docker logs --follow $(get_final_debugger_container ${imageName})`,
    ],
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
