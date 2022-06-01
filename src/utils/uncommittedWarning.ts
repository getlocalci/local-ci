import * as cp from 'child_process';
import * as vscode from 'vscode';
import { SUPPRESS_UNCOMMITTED_FILE_WARNING } from '../constants';
import getSpawnOptions from './getSpawnOptions';

/**
 * Shows a warning if there are uncommitted files in the repo.
 *
 * Those won't be part of the build.
 * Uncommitted changes to .circleci/config.yml will still be part of the build.
 */
export default function uncommittedWarning(
  context: vscode.ExtensionContext,
  repoPath: string,
  jobName: string,
  checkoutJobs: string[]
): void {
  if (context.globalState.get(SUPPRESS_UNCOMMITTED_FILE_WARNING)) {
    return;
  }

  // Gets tracked files that have an uncommitted diff.
  const { stdout } = cp.spawn(
    'git',
    ['status', '-suno'],
    getSpawnOptions(repoPath)
  );

  stdout.on('data', (data) => {
    const uncommittedFiles = data
      ?.toString()
      .split(`\n`)
      .filter(
        (line: string) =>
          !!line?.trim() &&
          !line.match(/\s\.circleci\/config\.yml/) && // The file should not start with .circleci/config.yml, as edits to that will appear in Local CI.
          !line.includes('.vscode/')
      )
      .join(', ');

    if (uncommittedFiles) {
      const textDontShowAgain = `Don't show again`;
      const checkoutJobMessage = checkoutJobs.includes(jobName)
        ? ``
        : `Then, please rerun a checkout job, like ${checkoutJobs.join(', ')}.`;

      vscode.window
        .showWarningMessage(
          `There are uncommitted changes that won't be part of this ${jobName} job: ${uncommittedFiles}.
        Please commit those changes if you'd like them to be part of the job. ${checkoutJobMessage}`,
          { detail: 'There are uncommitted changes' },
          textDontShowAgain
        )
        .then((clicked) => {
          if (clicked === textDontShowAgain) {
            context.globalState.update(SUPPRESS_UNCOMMITTED_FILE_WARNING, true);
          }
        });
    }
  });
}
