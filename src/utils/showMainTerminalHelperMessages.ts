import * as cp from 'child_process';
import * as vscode from 'vscode';
import Job from '../classes/Job';
import JobProvider from '../classes/JobProvider';
import { GET_PICARD_CONTAINER_FUNCTION } from '../constants';
import getSpawnOptions from './getSpawnOptions';

export default function showMainTerminalHelperMessages(
  jobProvider: JobProvider,
  job: Job | undefined,
  doesJobCreateDynamicConfig: boolean
): cp.ChildProcessWithoutNullStreams {
  const memoryMessage = 'Exited with code exit status 127';

  const process = cp.spawn(
    '/bin/sh',
    [
      '-c',
      `${GET_PICARD_CONTAINER_FUNCTION}
      until [[ -n $(get_picard_container ${job?.getJobName()}) ]]; do
        sleep 2
      done
      docker logs --follow $(get_picard_container ${job?.getJobName()})`,
    ],
    getSpawnOptions()
  );

  process.stdout.on('data', (data) => {
    const output = data?.toString();
    if (!output?.length) {
      return;
    }

    // This should be the final 'Success!' message when a job succeeds.
    // There can be lot of other 'Success!' messages that might trigger this incorrectly.
    if (output?.includes(`[32mSuccess![0m`)) {
      job?.setIsSuccess();

      if (doesJobCreateDynamicConfig) {
        jobProvider.refresh();
        vscode.window.showInformationMessage(
          'Success, you can now run the dynamic config jobs'
        );
      } else {
        jobProvider.refresh(job);
      }
    }

    if (output?.includes('Task failed')) {
      job?.setIsFailure();
      jobProvider.refresh(job);
    }

    if (output?.includes(memoryMessage)) {
      vscode.window.showInformationMessage(
        `This may have failed from a lack of Docker memory. You can increase it via Docker Desktop > Preferences > Resources > Advanced > Memory`
      );
    }
  });

  return process;
}
