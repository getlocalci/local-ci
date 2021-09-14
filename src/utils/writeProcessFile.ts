import * as fs from 'fs';
import * as yaml from 'js-yaml';
import getCheckoutJobs from './getCheckoutJobs';
import getConfigFile from './getConfigFile';
import getDefaultWorkspace from './getDefaultWorkspace';
import getImageFromJob from './getImageFromJob';
import { PROCESS_FILE_PATH } from '../constants';

// Rewrites the process.yml file.
// When there's a persist_to_workspace value, this copies
// the files to the volume so they can persist between jobs.
export default function writeProcessFile(): void {
  const checkoutJobs = getCheckoutJobs(PROCESS_FILE_PATH);
  const configFile = getConfigFile(PROCESS_FILE_PATH);

  if (!configFile) {
    return;
  }

  if (!checkoutJobs.length) {
    fs.writeFileSync(PROCESS_FILE_PATH, yaml.dump(configFile));
    return;
  }

  checkoutJobs.forEach((checkoutJob: string) => {
    if (!configFile || !configFile.jobs[checkoutJob]?.steps) {
      return;
    }

    // Simulate persist_to_workspace by copying the persisted files to the volume.
    configFile.jobs[checkoutJob].steps = configFile?.jobs[
      checkoutJob
    ]?.steps?.map((step: Step) => {
      if (!step?.persist_to_workspace) {
        return step;
      }

      const persistToWorkspacePath = step?.persist_to_workspace?.paths?.length
        ? step.persist_to_workspace.paths[0]
        : '';

      const pathBase =
        !step?.persist_to_workspace?.root ||
        '.' === step.persist_to_workspace.root
          ? configFile.jobs[checkoutJob]?.working_directory ??
            getDefaultWorkspace(getImageFromJob(configFile.jobs[checkoutJob]))
          : step.persist_to_workspace.root;

      const fullPath =
        !persistToWorkspacePath || persistToWorkspacePath === '.'
          ? pathBase
          : `${pathBase}/${persistToWorkspacePath}`;

      return step.persist_to_workspace && !fullPath.match(/\/tmp\/[^/]+$/)
        ? {
            run: {
              command: `cp -r ${fullPath} /tmp`,
            },
          }
        : step;
    });
  });

  fs.writeFileSync(PROCESS_FILE_PATH, yaml.dump(configFile));
}