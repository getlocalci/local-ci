import * as path from 'path';
import getCheckoutJobs from './getCheckoutJobs';
import getConfigFile from './getConfigFile';
import getDefaultWorkspace from './getDefaultWorkspace';

function getImageForJob(job: Job) {
  return job?.docker && job?.docker?.length ? job.docker[0]?.image : '';
}

export default function getCheckoutDirectoryBasename(
  processFile: string
): string {
  const checkoutJobs = getCheckoutJobs(processFile);
  const configFile = getConfigFile(processFile);

  if (!configFile || !checkoutJobs.length) {
    return '';
  }

  const checkoutJob = checkoutJobs[0];
  if (!configFile.jobs[checkoutJob]?.steps) {
    return '';
  }

  const stepWithPersist = configFile?.jobs[checkoutJob]?.steps?.find(
    (step) => step?.persist_to_workspace
  );

  const persistToWorkspacePath = stepWithPersist?.persist_to_workspace?.paths
    ?.length
    ? stepWithPersist.persist_to_workspace.paths[0]
    : '';

  const pathBase =
    !stepWithPersist?.persist_to_workspace?.root ||
    '.' === stepWithPersist.persist_to_workspace.root
      ? configFile.jobs[checkoutJob]?.working_directory ??
        getDefaultWorkspace(getImageForJob(configFile.jobs[checkoutJob]))
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
