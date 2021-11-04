import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import getCheckoutJobs from './getCheckoutJobs';
import getConfig from './getConfig';
import { CONTAINER_STORAGE_DIRECTORY } from '../constants';

// Rewrites the process.yml file.
// When there's a persist_to_workspace value in a checkout job, this copies
// the files inside the container to the volume shared with the local machine.
// This way, they can persist between jobs.
export default function writeProcessFile(
  processedConfig: string,
  processFilePath: string
): void {
  const config = getConfig(processedConfig);
  const checkoutJobs = getCheckoutJobs(config);

  if (!config) {
    return;
  }

  if (!checkoutJobs.length) {
    fs.writeFile(processFilePath, yaml.dump(config), () => '');
    return;
  }

  checkoutJobs.map(async (checkoutJob: string): Promise<void> => {
    if (!config || !config.jobs[checkoutJob]?.steps) {
      return;
    }

    // Simulate persist_to_workspace by copying the persisted files to the volume.
    // @todo: handle other jobs that persist_to_workspace, like https://github.com/kefranabg/bento-starter/blob/c5ec78a033d3915d700bd6463594508098d46448/.circleci/config.yml#L81
    config.jobs[checkoutJob].steps = config.jobs[checkoutJob].steps?.map(
      (step: Step) => {
        if (typeof step === 'string' || !step?.persist_to_workspace) {
          return step;
        }

        const persistToWorkspacePath = step?.persist_to_workspace?.paths?.length
          ? step?.persist_to_workspace.paths[0]
          : '';

        const pathBase =
          !step?.persist_to_workspace?.root ||
          '.' === step.persist_to_workspace.root
            ? config.jobs[checkoutJob]?.working_directory ?? '/home/circleci'
            : step.persist_to_workspace.root;

        const fullPath =
          !persistToWorkspacePath || persistToWorkspacePath === '.'
            ? pathBase
            : path.join(pathBase, persistToWorkspacePath);

        return {
          run: {
            command: `cp -r ${fullPath} ${CONTAINER_STORAGE_DIRECTORY}`,
          },
        };
      }
    );
  });

  if (!fs.existsSync(path.dirname(processFilePath))) {
    fs.mkdirSync(path.dirname(processFilePath), { recursive: true });
  }
  fs.writeFileSync(processFilePath, yaml.dump(config));
}
