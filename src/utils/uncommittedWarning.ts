import * as cp from 'child_process';
import * as vscode from 'vscode';
import { SUPPRESS_UNCOMMITTED_FILE_WARNING } from '../constants';
import getSpawnOptions from './getSpawnOptions';

// Shows a warning if there are uncommitted files in the repo.
// Those won't be part of the build.
// Uncommitted changes to .circleci/config.yml will still be part of the build.
export default function uncommittedWarning(
  context: vscode.ExtensionContext,
  repoPath: string,
  jobName: string
): void {
  if (context.globalState.get(SUPPRESS_UNCOMMITTED_FILE_WARNING)) {
    return;
  }

  const { stdout } = cp.spawn(
    'git',
    ['status', '-s'],
    getSpawnOptions(repoPath)
  );

  stdout.on('data', (data) => {
    const uncommittedFiles = data
      ?.toString()
      .split(`\n`)
      .filter(
        (line: string) =>
          !!line?.trim() && !line.includes('.circleci/config.yml')
      )
      .join(',');

    if (uncommittedFiles) {
      const textDontShowAgain = `Don't show again`;
      vscode.window
        .showWarningMessage(
          `There are uncommitted changes that won't be part of this ${jobName} job: ${uncommittedFiles}.
        Please commit those changes if you'd like them to be part of the job.`,
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
