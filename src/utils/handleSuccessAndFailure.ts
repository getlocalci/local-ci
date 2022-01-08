import * as cp from 'child_process';
import * as vscode from 'vscode';
import Job from '../classes/Job';
import JobProvider from '../classes/JobProvider';
import { GET_PICARD_CONTAINER_FUNCTION } from '../constants';
import getConfigFilePath from './getConfigFilePath';
import getConfigFromPath from './getConfigFromPath';
import getDynamicConfigFilePath from './getDynamicConfigFilePath';
import getSpawnOptions from './getSpawnOptions';

export default function handleSuccessAndFailure(
  context: vscode.ExtensionContext,
  jobProvider: JobProvider,
  job: Job | undefined,
  commitProcess: cp.ChildProcess,
  doesJobCreateDynamicConfig: boolean
): cp.ChildProcessWithoutNullStreams {
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

  process.stdout.on('data', async (data) => {
    const output = data?.toString();
    if (!output?.length) {
      return;
    }

    // This should be the final 'Success!' message when a job succeeds.
    // There can be lot of other 'Success!' messages that might trigger this incorrectly.
    // @todo: look for a more reliable way to detect success.
    if (output?.includes(`[32mSuccess![0m`)) {
      job?.setIsSuccess();
      commitProcess.kill();

      if (doesJobCreateDynamicConfig) {
        jobProvider.refresh();
        const dynamicConfig = getConfigFromPath(
          getDynamicConfigFilePath(await getConfigFilePath(context))
        );

        vscode.window.showInformationMessage(
          dynamicConfig?.jobs
            ? `Success! You can now run the dynamic config jobs.`
            : `The step succeeded, but it didn't create any dynamic job`
        );
      } else {
        jobProvider.refresh(job);
      }
    }

    if (output?.includes('Task failed')) {
      job?.setIsFailure();
      jobProvider.refresh(job);
      commitProcess.kill();

      if (output?.includes('error looking up cgroup')) {
        const moreInformationText = 'More information';
        vscode.window.showErrorMessage(
          'You can probably fix this failed job by running this on your local machine: rm ~/.circleci/build_agent_settings.json',
          { detail: 'Possible solution' },
          moreInformationText
        ).then((clicked) => {
          if (clicked === moreInformationText) {
            vscode.env.openExternal(vscode.Uri.parse('https://github.com/CircleCI-Public/circleci-cli/issues/589#issuecomment-1005865018'));
          }
        });
      }

      if (output?.includes('mkdir /host_mnt/private/tmp/local-ci/volume: no such file or directory')) {
        vscode.window.showErrorMessage(
          `Restarting Docker Desktop should fix that error 'no such file or directory' error, though that's not fun`,
          { detail: 'Possible solution' },
        );
      }

    }

    if (output?.includes('compinit: insecure directories')) {
      const possibleSolutionText = 'See a possible solution';
      vscode.window.showInformationMessage(
        `Here's a possible solution to the compinit error:`,
        { detail: 'Possible solution' },
        possibleSolutionText
      )
      .then((clicked) => {
        if (clicked === possibleSolutionText) {
          vscode.env.openExternal(vscode.Uri.parse('https://github.com/zsh-users/zsh-completions/issues/680#issuecomment-864906013'));
        }
      });
    }

    if (output?.includes('Exited with code exit status 127')) {
      vscode.window.showInformationMessage(
        'This may have failed from a lack of Docker memory. You can increase it via Docker Desktop > Preferences > Resources > Advanced > Memory'
      );
    }
  });

  return process;
}
