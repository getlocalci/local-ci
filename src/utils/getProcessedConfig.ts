import * as cp from 'child_process';
import { getBinaryPath } from '../../node/binary.js';
import getSpawnOptions from './getSpawnOptions';

// Gets the plain text of the processed .circleci/config.yml file.
// The CircleCI CLI binary compiles that .yml file into another .yml file.
// For example, it copies orbs into the file and evaluates the job parameters.
export default function getProcessedConfig(configFilePath: string): string {
  const { stdout, stderr } = cp.spawnSync(
    getBinaryPath(),
    ['config', 'process', configFilePath],
    getSpawnOptions()
  );

  if (!stdout?.length) {
    throw new Error(
      stderr?.length ? stderr.toString() : 'Failed to process the config'
    );
  }

  return stdout.toString().trim();
}
