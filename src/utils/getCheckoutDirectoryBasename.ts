import * as path from 'path';
import * as vscode from 'vscode';
import getCheckoutJobs from './getCheckoutJobs';
import getConfigFromPath from './getConfigFromPath';
import getProjectDirectory from './getProjectDirectory';
import getImageFromJob from './getImageFromJob';

export default async function getCheckoutDirectoryBasename(
  processFile: string,
  terminal: vscode.Terminal
): Promise<string> {
  const checkoutJobs = getCheckoutJobs(processFile);
  const configFile = getConfigFromPath(processFile);

  if (!configFile || !checkoutJobs.length) {
    return '';
  }

  const checkoutJob = checkoutJobs[0];
  if (!configFile.jobs[checkoutJob]?.steps) {
    return '';
  }

  const stepWithPersist = configFile?.jobs[checkoutJob]?.steps?.find(
    (step: Step) => step?.persist_to_workspace
  );

  const persistToWorkspacePath = stepWithPersist?.persist_to_workspace?.paths
    ?.length
    ? stepWithPersist.persist_to_workspace.paths[0]
    : '';

  const pathBase =
    !stepWithPersist?.persist_to_workspace?.root ||
    '.' === stepWithPersist.persist_to_workspace.root
      ? configFile.jobs[checkoutJob]?.working_directory ??
        (await getProjectDirectory(
          getImageFromJob(configFile.jobs[checkoutJob]),
          terminal
        ))
      : stepWithPersist.persist_to_workspace.root;

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
