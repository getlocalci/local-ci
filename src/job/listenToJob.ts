import * as cp from 'child_process';
import * as fs from 'fs';
import * as vscode from 'vscode';
import Job from 'job/Job';
import JobProvider from 'job/JobProvider';
import { SUPPRESS_JOB_COMPLETE_MESSAGE } from 'constants/';
import { getPicardContainerFunction } from 'scripts/';
import getConfigFilePath from 'config/getConfigFilePath';
import getConfigFromPath from 'config/getConfigFromPath';
import getDynamicConfigPath from 'config/getDynamicConfigPath';
import Spawn from 'common/Spawn';
import showLogFile from 'log/showLogFile';

function handleExit(
  context: vscode.ExtensionContext,
  job: Job | undefined,
  logFilePath: string,
  didSucceed: boolean
): void {
  const folderUri = vscode.workspace.workspaceFolders?.length
    ? vscode.workspace.workspaceFolders[0].uri
    : null;

  if (!folderUri || context.globalState.get(SUPPRESS_JOB_COMPLETE_MESSAGE)) {
    return;
  }

  const showJobOutput = 'Show job log';
  const dontShowAgain = `Don't show again`;
  vscode.window
    .showInformationMessage(
      `The job ${job?.getJobName()} ${didSucceed ? 'succeeded' : 'failed'}`,
      showJobOutput,
      dontShowAgain
    )
    .then((clicked) => {
      if (clicked === showJobOutput) {
        showLogFile(logFilePath);
      }

      if (clicked === dontShowAgain) {
        context.globalState.update(SUPPRESS_JOB_COMPLETE_MESSAGE, true);
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
      ${getPicardContainerFunction}
      until [ -n $(get_picard_container ${jobName}) ]
      do
        sleep 2
      done
      docker logs --follow $(get_picard_container ${jobName})`,
    ],
    new Spawn().getOptions()
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

      handleExit(context, job, logFilePath, true);
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

      handleExit(context, job, logFilePath, false);
      commitProcess.kill();
    }

    const dockerRelatedErrors = [
      'failed to create runner binary',
      'error while creating mount source path',
    ];

    dockerRelatedErrors.forEach((errorMessage) => {
      if (output?.includes(errorMessage)) {
        vscode.window.showErrorMessage(
          `Restarting Docker Desktop should fix that error '${errorMessage}', though that's not fun`,
          { detail: 'Possible solution' }
        );
      }
    });

    const errors = [
      {
        message: 'compinit: insecure directories',
        solutionUrl:
          'https://github.com/zsh-users/zsh-completions/issues/680#issuecomment-864906013',
      },
      {
        message: 'OCI runtime create failed',
        solutionUrl:
          'https://github.com/getlocalci/local-ci/discussions/121#discussion-4075651',
      },
      {
        message: '--storage-opt is supported only for overlay',
        solutionUrl:
          'https://github.com/getlocalci/local-ci/discussions/165#discussioncomment-3458645',
      },
    ];

    errors.forEach((error) => {
      if (output?.includes(error.message)) {
        const getBashCommandsText = 'Get Bash commands';
        vscode.window
          .showErrorMessage(
            'You might be able to fix this failed job with Bash commands',
            { detail: 'Possible solution' },
            getBashCommandsText
          )
          .then((clicked) => {
            if (clicked === getBashCommandsText) {
              vscode.env.openExternal(vscode.Uri.parse(error.solutionUrl));
            }
          });
      }
    });
  });

  return process;
}
