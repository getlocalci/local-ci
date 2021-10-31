import * as fs from 'fs';
import * as yaml from 'js-yaml';
import getCheckoutJobs from './getCheckoutJobs';
import getConfig from './getConfig';
import getProjectDirectory from './getProjectDirectory';
import getImageFromJob from './getImageFromJob';
import getProcessFilePath from './getProcessFilePath';
import { STORAGE_DIRECTORY } from '../constants';

// Rewrites the process.yml file.
// When there's a persist_to_workspace value, this copies
// the files to the volume so they can persist between jobs.
export default function writeProcessFile(configFilePath: string): void {
  const processFilePath = getProcessFilePath(configFilePath);
  const checkoutJobs = getCheckoutJobs(processFilePath);
  const config = getConfig(processFilePath);

  if (!config) {
    return;
  }

  if (!checkoutJobs.length) {
    fs.writeFile(processFilePath, yaml.dump(config), () => '');
    return;
  }

  Promise.all(
    checkoutJobs.map(async (checkoutJob: string) => {
      if (!config || !config.jobs[checkoutJob]?.steps) {
        return;
      }

      const projectDirectory = await getProjectDirectory(
        getImageFromJob(config.jobs[checkoutJob])
      );

      // Simulate persist_to_workspace by copying the persisted files to the volume.
      // @todo: handle other jobs that persist_to_workspace, like https://github.com/kefranabg/bento-starter/blob/c5ec78a033d3915d700bd6463594508098d46448/.circleci/config.yml#L81
      config.jobs[checkoutJob].steps = config?.jobs[checkoutJob]?.steps?.map(
        (step: Step) => {
          if (!step?.persist_to_workspace) {
            return step;
          }

          const persistToWorkspacePath = step?.persist_to_workspace?.paths
            ?.length
            ? step.persist_to_workspace.paths[0]
            : '';

          const pathBase =
            !step?.persist_to_workspace?.root ||
            '.' === step.persist_to_workspace.root
              ? config.jobs[checkoutJob]?.working_directory ?? projectDirectory
              : step.persist_to_workspace.root;

          const fullPath =
            !persistToWorkspacePath || persistToWorkspacePath === '.'
              ? pathBase
              : `${pathBase}/${persistToWorkspacePath}`;

          return step.persist_to_workspace
            ? {
                run: {
                  command: `cp -r ${fullPath} ${STORAGE_DIRECTORY}`,
                },
              }
            : step;
        }
      );
    })
  ).then(() => {
    fs.writeFile(processFilePath, yaml.dump(config), () => '');
  });
}
