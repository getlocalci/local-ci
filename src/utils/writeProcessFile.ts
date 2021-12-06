import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import getAttachWorkspaceCommand from './getAttachWorkspaceCommand';
import getCheckoutJobs from './getCheckoutJobs';
import getConfig from './getConfig';
import { CONTAINER_STORAGE_DIRECTORY } from '../constants';

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

function getRestoreCacheCommand(step: FullStep): string | undefined {
  if (step?.restore_cache?.key) {
    const cacheDirectory = `${path.join(
      CONTAINER_STORAGE_DIRECTORY,
      convertToBash(step.restore_cache.key)
    )}`;

    // BusyBox doesn't have the -n option.
    return `if [ -d ${cacheDirectory} ]; cp -rn ${cacheDirectory} . || cp -ru ${cacheDirectory} .; fi \n`;
  }

  return step?.restore_cache?.keys?.reduce((accumulator, directory) => {
    const fullDirectory = convertToBash(
      path.join(CONTAINER_STORAGE_DIRECTORY, directory)
    );

    return `${accumulator} if [ -d ${fullDirectory} ]; then cp -rn ${fullDirectory} . || cp -ru ${fullDirectory} .; fi \n`;
  }, '');
}

function getSaveCacheCommand(step: FullStep): string | undefined {
  return step?.save_cache?.paths.reduce((accumulator, directory) => {
    const destination = path.join(
      CONTAINER_STORAGE_DIRECTORY,
      convertToBash(step?.save_cache?.key ?? '')
    );

    return `${accumulator} mkdir -p ${destination}; cp -rn ${directory} ${destination} || cp -ru ${directory} ${destination} \n`;
  }, '');
}

// See https://circleci.com/docs/2.0/caching/#using-keys-and-templates
// arch doesn't need to be replaced.
// @todo: implement .Revision
const dynamicCache: DynamicCache = {
  '.Branch': '$CIRCLE_BRANCH',
  '.BuildNum': '$CIRCLE_BUILD_NUM',
  '.Environment.variableName': '',
  '.Revision': '',
  epoch: 'date +%s',
};

function convertToBash(command: string) {
  return command.replace(
    /{{(.+?)}}/g,
    (fullMatch: string, dynamicCommand: string) =>
      `$(${Object.keys(dynamicCache).reduce(
        (accumulator, original) =>
          accumulator
            .replace(original, dynamicCache[original as keyof DynamicCache])
            .replace(
              /checksum (\S+)/g,
              (fullMatch: string, fileName: string) =>
                `shasum ${fileName} | awk '{print $1}'`
            )
            .replace(
              /\.Environment\.(\S+)/,
              (fullMatch: string, envVar: string) => `echo $${envVar}`
            ),
        dynamicCommand
      )})`
  );
}

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
      (accumulator: Jobs | Record<string, unknown>, jobName: string) => {
        if (!config || !config.jobs[jobName]?.steps) {
          return {
            ...accumulator,
            [jobName]: config?.jobs[jobName],
          };
        }

        // Simulate attach_workspace and persist_to_workspace.
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
                    command: getRestoreCacheCommand(step),
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
