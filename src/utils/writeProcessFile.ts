import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import getAttachWorkspaceCommand from './getAttachWorkspaceCommand';
import getCheckoutJobs from './getCheckoutJobs';
import getConfig from './getConfig';
import {
  ATTACH_WORKSPACE_STEP_NAME,
  CONTAINER_STORAGE_DIRECTORY,
} from '../constants';

// Overwrites parts of the process.yml file.
// When there's a persist_to_workspace value in a checkout job, this copies
// the files inside the container to the volume shared with the local machine.
// This way, they can persist between jobs.
// The processedConfig was already compiled by the CircleCI® CLI binary.
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

  Object.keys(config.jobs).map(async (jobName: string): Promise<void> => {
    if (!config || !config.jobs[jobName]?.steps) {
      return;
    }

    // Simulate attach_workspace and persist_to_workspace.
    // @todo: handle other jobs that persist_to_workspace, like https://github.com/kefranabg/bento-starter/blob/c5ec78a033d3915d700bd6463594508098d46448/.circleci/config.yml#L81
    config.jobs[jobName].steps = config.jobs[jobName].steps?.map(
      (step: Step) => {
        if (typeof step === 'string') {
          return step;
        }

        if (step?.attach_workspace) {
          return {
            run: {
              name: ATTACH_WORKSPACE_STEP_NAME,
              command: getAttachWorkspaceCommand(step),
            },
          };
        }

        if (step?.persist_to_workspace) {
          return {
            run: {
              name: 'Persist to workspace',
              command: step?.persist_to_workspace?.paths.reduce(
                (accumulator, workspacePath) => {
                  const pathToPersist = path.join(
                    step?.persist_to_workspace?.root ?? '.',
                    workspacePath
                  );

                  // BusyBox doesn't have the -n option.
                  return `${accumulator} cp -rn ${pathToPersist} ${CONTAINER_STORAGE_DIRECTORY} || cp -ru ${pathToPersist} ${CONTAINER_STORAGE_DIRECTORY} \n`;
                },
                ''
              ),
            },
          };
        }

        return step;
      }
    );
  });

  if (!fs.existsSync(path.dirname(processFilePath))) {
    fs.mkdirSync(path.dirname(processFilePath), { recursive: true });
  }
  fs.writeFileSync(processFilePath, yaml.dump(config));
}
