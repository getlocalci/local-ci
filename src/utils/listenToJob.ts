import * as cp from 'child_process';
import * as fs from 'fs';
import * as vscode from 'vscode';
import Job from '../classes/Job';
import JobProvider from '../classes/JobProvider';
import { GET_PICARD_CONTAINER_FUNCTION } from '../constants';
import getConfigFilePath from './getConfigFilePath';
import getConfigFromPath from './getConfigFromPath';
import getDynamicConfigPath from './getDynamicConfigPath';
import getSpawnOptions from './getSpawnOptions';
import showLogFile from './showLogFile';

function handleExit(
  job: Job | undefined,
  logFilePath: string,
  didSucceed: boolean
): void {
  const folderUri = vscode.workspace.workspaceFolders?.length
    ? vscode.workspace.workspaceFolders[0].uri
    : null;

  if (!folderUri) {
    return;
  }

  const showJobOutput = 'Show job log';
  vscode.window
    .showInformationMessage(
      `The job ${job?.getJobName()} ${didSucceed ? 'succeeded' : 'failed'}`,
      {
        title: showJobOutput,
      }
    )
    .then((clicked) => {
      if (clicked?.title === showJobOutput) {
        showLogFile(logFilePath);
      }
    });
}

export default function listenToJob(
  context: vscode.ExtensionContext,
  jobProvider: JobProvider,
  job: Job | undefined,
  commitProcess: cp.ChildProcess,
  doesJobCreateDynamicConfig: boolean,
  jobConfigPath: string,
  logFilePath: string
): cp.ChildProcessWithoutNullStreams {
  const jobName = job?.getJobName();
  fs.writeFileSync(
    logFilePath,
    `Log for CircleCI® job ${jobName} \n${new Date()} \n\n`
  );

  const process = cp.spawn(
    '/bin/sh',
    [
      '-c',
      `cat ${jobConfigPath} >> ${logFilePath}
      ${GET_PICARD_CONTAINER_FUNCTION}
      until [[ -n $(get_picard_container ${jobName}) ]]
      do
        sleep 2
      done
      docker logs --follow $(get_picard_container ${jobName})`,
    ],
    getSpawnOptions()
  );

  process.stdout.on('data', async (data) => {
    const output = data?.toString();
    if (!output?.length) {
      return;
    }

    fs.appendFileSync(
      logFilePath,
      // Remove terminal color encoding, like [32m
      // Convert this: [32mSuccess![0m
      // To: Success!
      output.replace(/\[[0-9]+m/g, '') // eslint-disable-line no-control-regex
    );

    // This should be the final 'Success!' message when a job succeeds.
    // There are a lot of other 'Success!' messages that might trigger this incorrectly.
    // @todo: look for a more reliable way to detect success.
    if (output?.includes(`[32mSuccess![0m`)) {
      job?.setIsSuccess();
      job?.setExpanded();
      jobProvider.refresh(job);

      handleExit(job, logFilePath, true);
      commitProcess.kill();

      if (doesJobCreateDynamicConfig) {
        jobProvider.hardRefresh();
        const dynamicConfig = getConfigFromPath(
          getDynamicConfigPath(await getConfigFilePath(context))
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
      job?.setExpanded();
      jobProvider.refresh(job);

      handleExit(job, logFilePath, false);
      commitProcess.kill();
    }

    if (output?.includes('failed to create runner binary')) {
      vscode.window.showErrorMessage(
        `Restarting Docker Desktop should fix that error 'failed to create runner binary', though that's not fun`,
        { detail: 'Possible solution' }
      );
    }

    if (output?.includes('compinit: insecure directories')) {
      const possibleSolutionText = 'See a possible solution';
      vscode.window
        .showErrorMessage(
          `Here's a possible solution to the compinit error:`,
          { detail: 'Possible solution' },
          possibleSolutionText
        )
        .then((clicked) => {
          if (clicked === possibleSolutionText) {
            vscode.env.openExternal(
              vscode.Uri.parse(
                'https://github.com/zsh-users/zsh-completions/issues/680#issuecomment-864906013'
              )
            );
          }
        });
    }

    if (output?.includes('OCI runtime create failed')) {
      const moreInformationText = 'Get Bash command';
      vscode.window
        .showErrorMessage(
          `You can probably fix this failed job with a Bash command`,
          { detail: 'Possible solution' },
          moreInformationText
        )
        .then((clicked) => {
          if (clicked === moreInformationText) {
            vscode.env.openExternal(
              vscode.Uri.parse(
                'https://github.com/getlocalci/local-ci/discussions/121#discussion-4075651'
              )
            );
          }
        });
    }
  });

  return process;
}
