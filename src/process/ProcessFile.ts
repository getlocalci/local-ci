import { injectable, inject } from 'inversify';
import Types from 'common/Types';
import * as path from 'path';
import * as yaml from 'js-yaml';
import FsGateway from 'gateway/FsGateway';
import getConfig from 'config/getConfig';
import Persistence from './Persistence';
import { CONTAINER_STORAGE_DIRECTORY } from 'constant';
import EnvVar from './EnvVar';

@injectable()
export default class ProcessFile {
  @inject(Types.IEnvVar)
  envVar!: EnvVar;

  @inject(Types.IFsGateway)
  fsGateway!: FsGateway;

  @inject(Persistence)
  persistence!: Persistence;

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

    const newConfig = {
      ...config,
      jobs: Object.entries(config?.jobs ?? {}).reduce(
        (
          accumulator: Jobs | Record<string, unknown>,
          [jobName, job]: [string, Job]
        ) => {
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
                this.envVar.getStep(repoPath),
                ...(this.persistence.replaceSteps(job, config) ?? []),
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
  getOutputPath(steps: Job['steps']): string | undefined {
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

  /**
   * Gets whether this is a custom `git clone` command.
   *
   * Local CI doesn't work with that.
   * The idea of Local CI is to use your local commits, not to git clone from the remote repo.
   * So this will find if there's a custom `git clone` command,
   * so it can replace it with `checkout`.
   * The CLI handles `checkout` well.
   */
  isCustomClone(step: FullStep): boolean {
    const clonePattern = /git clone[^\n]+\$CIRCLE_REPOSITORY_URL/;
    return (
      (typeof step?.run === 'string' && !!step.run.match(clonePattern)) ||
      (typeof step?.run !== 'string' &&
        !!step?.run?.command?.match(clonePattern))
    );
  }
}
