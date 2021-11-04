import * as cp from 'child_process';
import * as vscode from 'vscode';
import { GET_PICARD_CONTAINER_FUNCTION } from '../constants';
import getSpawnOptions from './getSpawnOptions';

export default function showMainTerminalHelperMessages(): void {
  const memoryMessage = 'Exited with code exit status 127';

  const { stdout } = cp.spawn(
    '/bin/sh',
    [
      '-c',
      `${GET_PICARD_CONTAINER_FUNCTION}
      until [[ -n $(get_picard_container) ]]; do
        sleep 2
      done
      docker logs --follow $(get_picard_container)`,
    ],
    getSpawnOptions()
  );

  stdout.on('data', (data) => {
    if (data?.toString()?.includes(memoryMessage)) {
      vscode.window.showInformationMessage(
        `This may have failed from a lack of Docker memory. You can increase it via Docker Desktop > Preferences > Resources > Advanced > Memory`
      );
    }
  });
}
