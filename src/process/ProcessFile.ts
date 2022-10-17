import { injectable, inject } from 'inversify';
import Types from 'common/Types';
import * as path from 'path';
import * as yaml from 'js-yaml';
import FsGateway from 'gateway/FsGateway';
import getAttachWorkspaceCommand from 'config/getAttachWorkspaceCommand';
import getConfig from 'config/getConfig';
import getRestoreCacheCommand from 'cache/getRestoreCacheCommand';
import getSaveCacheCommand from 'cache/getSaveCacheCommand';
import getSaveCacheSteps from 'cache/getSaveCacheSteps';
import {
  CONTAINER_STORAGE_DIRECTORY,
  CONTINUE_PIPELINE_STEP_NAME,
  DYNAMIC_CONFIG_PARAMETERS_FILE_NAME,
  DYNAMIC_CONFIG_PATH_IN_CONTAINER,
} from 'constant';
import Spawn from 'common/Spawn';
import EnvVar from './EnvVar';

@injectable()
export default class ProcessFile {
  @inject(Types.IEnvVar)
  envVar!: EnvVar;

  @inject(Types.IFsGateway)
  fsGateway!: FsGateway;

  @inject(Spawn)
  spawn!: Spawn;

  /**
   * Overwrites parts of the process.yml file.
   *
   * For example, when there's a persist_to_workspace value in a checkout job,
   * this copies the files inside the container to the volume shared with the local machine.
   * This way, they can persist between jobs.
   * Likewise, on attach_workspace, it copies from the volume.
   * The processedConfig was already compiled by the CircleCI CLI binary.
   */
  write(processedConfig: string, processFilePath: string, repoPath: string) {
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
                  command: this.getPersistToWorkspaceCommand(step),
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
              const outputPath = this.getOutputPath(configJobs[jobName].steps);

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

          return {
            ...accumulator,
            [jobName]: {
              ...configJobs[jobName],
              steps: [
                this.getEnsureVolumeIsWritableStep(),
                this.envVar.getStep(repoPath),
                ...(newSteps ?? []),
              ],
            },
          };
        },
        {}
      ),
    };

    if (!this.fsGateway.fs.existsSync(path.dirname(processFilePath))) {
      this.fsGateway.fs.mkdirSync(path.dirname(processFilePath), {
        recursive: true,
      });
    }
    this.fsGateway.fs.writeFileSync(processFilePath, yaml.dump(newConfig));
  }

  /**
   * Gets the output-path environment variable from the path-filtering orb.
   *
   * https://circleci.com/developer/orbs/orb/circleci/path-filtering#commands
   */
  private getOutputPath(steps: Job['steps']): string | undefined {
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

  private getPersistToWorkspaceCommand(step: FullStep): string | undefined {
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

  private getEnsureVolumeIsWritableStep() {
    return {
      run: {
        name: 'Ensure volume is writable',
        command: `if [ "$(ls -ld ${CONTAINER_STORAGE_DIRECTORY} | awk '{print $3}')" != "$(whoami)" ] && [ "$(sudo -V 2>/dev/null)" ]
          then
          sudo chown $(whoami) ${CONTAINER_STORAGE_DIRECTORY}
        fi`,
      },
    };
  }
}
