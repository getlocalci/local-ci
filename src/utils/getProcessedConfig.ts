import * as cp from 'child_process';
import { getBinaryPath } from '../../node/binary.js';
import getSpawnOptions from './getSpawnOptions';

/**
 * Gets the contents of the processed .circleci/config.yml file.
 *eee
 * The CircleCI CLI binary compiles that .yml file into another .yml file.
 * For example, it copies orbs into the file and evaluates the job parameters.
 */
export default function getProcessedConfig(configFilePath: string): string {
  return cp
    .execFileSync(
      getBinaryPath(),
      ['config', 'process', configFilePath],
      getSpawnOptions()
    )
    .toString()
    .trim();
}
