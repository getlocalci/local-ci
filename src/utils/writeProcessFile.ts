import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import getAttachWorkspaceCommand from './getAttachWorkspaceCommand';
import getConfig from './getConfig';
import getRestoreCacheCommand from './getRestoreCacheCommand';
import getSaveCacheCommand from './getSaveCacheCommand';
import getSaveCacheSteps from './getSaveCacheSteps';
import {
  CONTAINER_STORAGE_DIRECTORY,
  CONTINUE_PIPELINE_STEP_NAME,
  DYNAMIC_CONFIG_PARAMETERS_FILE_NAME,
  DYNAMIC_CONFIG_PATH_IN_CONTAINER,
} from '../constants';

function getPersistToWorkspaceCommand(step: FullStep): string | undefined {
  if (typeof step?.persist_to_workspace?.paths === 'string') {
    const pathToPersist = path.join(
      step?.persist_to_workspace?.root ?? '.',
      step?.persist_to_workspace?.paths
    );

    // BusyBox doesn't have the -n option.
    return `cp -rn ${pathToPersist} ${CONTAINER_STORAGE_DIRECTORY} || cp -ru ${pathToPersist} ${CONTAINER_STORAGE_DIRECTORY}`;
  }

  return step?.persist_to_workspace?.paths.reduce(
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

function getEnsureVolumeIsWritableStep() {
  return {
    run: {
      name: 'Ensure volume is writable',
      command: `if [ $(ls -l ${CONTAINER_STORAGE_DIRECTORY} | awk '{print $3}') != $(whoami) ]
        then
        sudo chown $(whoami) ${CONTAINER_STORAGE_DIRECTORY}
      fi`,
    },
  };
}

function getEnvVarStep() {
  return {
    run: {
      name: 'Set more environment variables',
      command: `echo 'export CIRCLE_SHA1=$(git rev-parse HEAD)' >> $BASH_ENV
        echo 'export CIRCLE_BRANCH=$(git rev-parse --abbrev-ref HEAD)' >> $BASH_ENV`,
    },
  };
}

/**
 * Gets the output-path environment variable from the path-filtering orb.
 *
 * https://circleci.com/developer/orbs/orb/circleci/path-filtering#commands
 */
function getOutputPath(steps: Job['steps']): string | undefined {
  if (!steps) {
    return;
  }

  for (const step of steps) {
    if (
      typeof step !== 'string' &&
      typeof step?.run !== 'string' &&
      step?.run?.environment &&
      step?.run?.environment['OUTPUT_PATH']
    ) {
      return step?.run?.environment['OUTPUT_PATH'];
    }
  }
}

/**
 * Overwrites parts of the process.yml file.
 *
 * For example, when there's a persist_to_workspace value in a checkout job,
 * this copies the files inside the container to the volume shared with the local machine.
 * This way, they can persist between jobs.
 * Likewise, on attach_workspace, it copies from the volume.
 * The processedConfig was already compiled by the CircleCI® CLI binary.
 */
export default function writeProcessFile(
  processedConfig: string,
  processFilePath: string
): void {
  const config = getConfig(processedConfig);

  if (!config) {
    return;
  }

  const configJobs = config?.jobs ?? {};

  const newConfig = {
    ...config,
    jobs: Object.keys(configJobs).reduce(
      (accumulator: Jobs | Record<string, unknown>, jobName: string) => {
        if (!config || !configJobs[jobName]?.steps) {
          return {
            ...accumulator,
            [jobName]: configJobs[jobName],
          };
        }

        const newSteps = configJobs[jobName].steps?.map((step: Step) => {
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
            return {
              run: {
                name: 'Persist to workspace',
                command: getPersistToWorkspaceCommand(step),
              },
            };
          }

          if (step?.restore_cache) {
            return {
              run: {
                name: 'Restore cache',
                command: getRestoreCacheCommand(
                  step,
                  getSaveCacheSteps(config)
                ),
              },
            };
          }

          if (step?.save_cache) {
            return {
              run: {
                name: 'Save cache',
                command: getSaveCacheCommand(step),
              },
            };
          }

          // Look for the circleci/continuation orb, which continues a dynamic config.
          // That orb is also in the circleci/path-filtering orb.
          // https://circleci.com/developer/orbs/orb/circleci/continuation
          // https://circleci.com/developer/orbs/orb/circleci/path-filtering
          if (
            typeof step?.run !== 'string' &&
            step?.run?.command?.includes('$CIRCLE_CONTINUATION_KEY') &&
            step?.run?.environment &&
            step?.run?.environment['CONFIG_PATH']
          ) {
            const outputPath = getOutputPath(configJobs[jobName].steps);

            return {
              run: {
                name: CONTINUE_PIPELINE_STEP_NAME,
                command: `if [ -f ${DYNAMIC_CONFIG_PATH_IN_CONTAINER} ]
                then
                  rm ${DYNAMIC_CONFIG_PATH_IN_CONTAINER}
                fi
                cp ${
                  step?.run?.environment['CONFIG_PATH']
                } ${DYNAMIC_CONFIG_PATH_IN_CONTAINER}
                ${
                  outputPath
                    ? `if [ -f ${outputPath} ]
                      then
                        cp ${outputPath} ${path.join(
                        CONTAINER_STORAGE_DIRECTORY,
                        DYNAMIC_CONFIG_PARAMETERS_FILE_NAME
                      )}
                      fi`
                    : ``
                }`,
              },
            };
          }

          return step;
        });

        // If a 'checkout' step exists, insert env vars right after it.
        if (newSteps?.includes('checkout')) {
          newSteps?.splice(
            newSteps?.indexOf('checkout') + 1,
            0,
            getEnvVarStep()
          );
        }

        return {
          ...accumulator,
          [jobName]: {
            ...configJobs[jobName],
            steps: [getEnsureVolumeIsWritableStep(), ...(newSteps ?? [])],
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
