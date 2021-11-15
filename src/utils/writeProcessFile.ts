import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import getAttachWorkspaceCommand from './getAttachWorkspaceCommand';
import getCheckoutJobs from './getCheckoutJobs';
import getConfig from './getConfig';
import { CONTAINER_STORAGE_DIRECTORY } from '../constants';

// Overwrites parts of the process.yml file.
// When there's a persist_to_workspace value in a checkout job, this copies
// the files inside the container to the volume shared with the local machine.
// This way, they can persist between jobs.
// Likewise, on attach_workspace, it copies from the volume.
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

  const newConfig = {
    ...config,
    jobs: Object.keys(config.jobs).reduce(
      (accumulator: Record<string, Job>, jobName: string) => {
        if (!config || !config.jobs[jobName]?.steps) {
          return {
            ...accumulator,
            [jobName]: config?.jobs[jobName],
          };
        }

        // Simulate attach_workspace and persist_to_workspace.
        // @todo: handle other jobs that persist_to_workspace, like https://github.com/kefranabg/bento-starter/blob/c5ec78a033d3915d700bd6463594508098d46448/.circleci/config.yml#L81
        return {
          ...accumulator,
          [jobName]: {
            ...config.jobs[jobName],
            steps: config.jobs[jobName].steps?.map((step: Step) => {
              if (typeof step === 'string') {
                return step;
              }

              if (step?.attach_workspace) {
                return {
                  run: {
                    name: 'Attach workspace',
                    command: getAttachWorkspaceCommand(step),
                  },
                };
              }

              if (step?.persist_to_workspace) {
                let command;

                if (typeof step?.persist_to_workspace?.paths === 'string') {
                  const pathToPersist = path.join(
                    step?.persist_to_workspace?.root ?? '.',
                    step?.persist_to_workspace?.paths
                  );

                  // BusyBox doesn't have the -n option.
                  command = `cp -rn ${pathToPersist} ${CONTAINER_STORAGE_DIRECTORY} || cp -ru ${pathToPersist} ${CONTAINER_STORAGE_DIRECTORY}`;
                } else {
                  command = step?.persist_to_workspace?.paths.reduce(
                    (accumulator, workspacePath) => {
                      const pathToPersist = path.join(
                        step?.persist_to_workspace?.root ?? '.',
                        workspacePath
                      );

                      // BusyBox doesn't have the -n option.
                      return `${accumulator} cp -rn ${pathToPersist} ${CONTAINER_STORAGE_DIRECTORY} || cp -ru ${pathToPersist} ${CONTAINER_STORAGE_DIRECTORY} \n`;
                    },
                    ''
                  );
                }

                return {
                  run: {
                    name: 'Persist to workspace',
                    command,
                  },
                };
              }

              return step;
            }),
          },
        };
      },
      {}
    ),
  };

  if (!fs.existsSync(path.dirname(processFilePath))) {
    fs.mkdirSync(path.dirname(processFilePath), { recursive: true });
  }
  fs.writeFileSync(processFilePath, yaml.dump(newConfig));
}
