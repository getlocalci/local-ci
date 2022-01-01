import * as cp from 'child_process';
import * as vscode from 'vscode';
import JobProvider from '../classes/JobProvider';
import { GET_PICARD_CONTAINER_FUNCTION } from '../constants';
import getSpawnOptions from './getSpawnOptions';

export default function showMainTerminalHelperMessages(
  jobProvider: JobProvider,
  doesJobCreateDynamicConfig: boolean
): cp.ChildProcessWithoutNullStreams {
  const memoryMessage = 'Exited with code exit status 127';

  const process = cp.spawn(
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

  process.stdout.on('data', (data) => {
    if (doesJobCreateDynamicConfig && data?.toString()?.includes('Success!')) {
      jobProvider.refresh();
      vscode.window.showInformationMessage(
        `You can now run the dynamic config jobs`
      );
    }

    if (data?.toString()?.includes(memoryMessage)) {
      vscode.window.showInformationMessage(
        `This may have failed from a lack of Docker memory. You can increase it via Docker Desktop > Preferences > Resources > Advanced > Memory`
      );
    }
  });

  return process;
}
