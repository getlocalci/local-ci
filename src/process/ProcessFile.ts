import * as path from 'path';
import * as yaml from 'js-yaml';
import FsGateway from 'gateway/FsGateway';
import getConfig from 'config/getConfig';
import getRepoPath from 'common/getRepoPath';
import Persistence from './Persistence';
import { CONTAINER_STORAGE_DIRECTORY } from 'constant';
import EnvVar from './EnvVar';

export default class ProcessFile {
  constructor(
    public envVar: EnvVar,
    public fsGateway: FsGateway,
    public persistence: Persistence
  ) {}

  /**
   * Overwrites parts of the process.yml file.
   *
   * For example, when there's a persist_to_workspace value in a checkout job,
   * this copies the files inside the container to the volume shared with the local machine.
   * This way, they can persist between jobs.
   * Likewise, on attach_workspace, it copies from the volume.
   * The processedConfig was already compiled by the CircleCI CLI binary.
   */
  write(
    processedConfig: string,
    processFilePath: string,
    configFilePath: string
  ) {
    const config = getConfig(processedConfig);

    if (!config) {
      return;
    }

    if (!this.fsGateway.fs.existsSync(path.dirname(processFilePath))) {
      this.fsGateway.fs.mkdirSync(path.dirname(processFilePath), {
        recursive: true,
      });
    }

    this.fsGateway.fs.writeFileSync(
      processFilePath,
      yaml.dump(this.getWriteableConfig(config, configFilePath))
    );
  }

  getWriteableConfig(
    config: NonNullable<CiConfig>,
    configFilePath: string
  ): NonNullable<CiConfig> {
    return this.substituteSteps(
      this.persistence.simulateAttachWorkspace(config, configFilePath),
      configFilePath
    );
  }

  substituteSteps(
    config: NonNullable<CiConfig>,
    configFilePath: string
  ): NonNullable<CiConfig> {
    return {
      ...config,
      jobs: Object.entries(config?.jobs ?? {}).reduce(
        (accumulator, [jobName, job]: [string, Job]) => {
          if (!config || !job?.steps) {
            return {
              ...accumulator,
              [jobName]: job,
            };
          }

          return {
            ...accumulator,
            [jobName]: {
              ...job,
              steps: [
                this.getEnsureVolumeIsWritableStep(),
                this.envVar.getStep(getRepoPath(configFilePath)),
                ...(this.persistence.replaceSteps(job, config) ?? []),
              ],
            },
          };
        },
        {}
      ),
    };
  }

  getEnsureVolumeIsWritableStep() {
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
