import * as path from 'path';
import * as vscode from 'vscode';
import getCheckoutJobs from './getCheckoutJobs';
import getWorkingDirectory from './getWorkingDirectory';
import getImageFromJob from './getImageFromJob';

export default async function getCheckoutDirectoryBasename(
  config: CiConfig,
  terminal: vscode.Terminal
): Promise<string> {
  const checkoutJobs = getCheckoutJobs(config);

  if (!config || !checkoutJobs.length) {
    return '';
  }

  const checkoutJob = checkoutJobs[0];
  if (!config.jobs[checkoutJob]?.steps) {
    return '';
  }

  const stepWithPersist = config?.jobs[checkoutJob]?.steps?.find(
    (step: Step) => typeof step !== 'string' && step?.persist_to_workspace
  );

  const persistToWorkspace = (stepWithPersist as FullStep)
    ?.persist_to_workspace;

  const persistToWorkspacePath = persistToWorkspace?.paths?.length
    ? persistToWorkspace.paths[0]
    : '';

  const pathBase =
    !persistToWorkspace?.root || '.' === persistToWorkspace.root
      ? config.jobs[checkoutJob]?.working_directory ??
        (await getWorkingDirectory(
          getImageFromJob(config.jobs[checkoutJob]),
          config.jobs[checkoutJob],
          terminal
        ))
      : persistToWorkspace.root;

  // If the checkout job has a persist_to_workspace of /tmp,
  // no need to get a checkout directory.
  // The volume will mount to /tmp, so it's already in the correct directory.
  if (pathBase.match(/\/tmp\/?$/)) {
    return '';
  }

  return !persistToWorkspacePath || persistToWorkspacePath === '.'
    ? path.basename(pathBase)
    : path.basename(persistToWorkspacePath);
}
