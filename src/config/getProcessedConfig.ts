import type { ExecFileSyncOptions } from 'child_process';
import { getBinaryPath } from '../../node/binary.js';
import ChildProcessGateway from 'gateway/ChildProcessGateway.js';

/**
 * Gets the contents of the processed .circleci/config.yml file.
 *
 * The CircleCI CLI binary compiles that .yml file into another .yml file.
 * For example, it copies orbs into the file and evaluates the job parameters.
 */
export default function getProcessedConfig(
  configFilePath: string,
  cp: ChildProcessGateway['cp'],
  spawnOptions: ExecFileSyncOptions
): string {
  return cp
    .execFileSync(
      getBinaryPath(),
      ['config', 'process', configFilePath],
      spawnOptions
    )
    .toString()
    .trim();
}
