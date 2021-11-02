import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';
import getCheckoutJobs from './getCheckoutJobs';
import getConfig from './getConfig';
import getProjectDirectory from './getProjectDirectory';
import getImageFromJob from './getImageFromJob';
import { CONTAINER_STORAGE_DIRECTORY } from '../constants';

// Rewrites the process.yml file.
// When there's a persist_to_workspace value in a checkout job, this copies
// the files to the volume so they can persist between jobs.
export default async function writeProcessFile(
  processedConfig: string,
  processFilePath: string,
  configFilePath: string
): Promise<void> {
  const checkoutJobs = getCheckoutJobs(configFilePath);
  const config = getConfig(processedConfig);

  if (!config) {
    return Promise.resolve();
  }

  if (!checkoutJobs.length) {
    fs.writeFile(processFilePath, yaml.dump(config), () => '');
    return Promise.resolve();
  }

  return Promise.all(
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
              : path.join(pathBase, persistToWorkspacePath);

          return step.persist_to_workspace
            ? {
                run: {
                  command: `cp -r ${fullPath} ${CONTAINER_STORAGE_DIRECTORY}`,
                },
              }
            : step;
        }
      );
    })
  ).then(() => {
    if (!fs.existsSync(path.dirname(processFilePath))) {
      fs.mkdirSync(path.dirname(processFilePath), { recursive: true });
    }
    fs.writeFileSync(processFilePath, yaml.dump(config));
  });
}
