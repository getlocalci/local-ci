import * as cp from 'child_process';
import { getBinaryPath } from '../../node/binary.js';
import getSpawnOptions from './getSpawnOptions';

// Gets the plain text of the processed .circleci/config.yml file.
// The CircleCI CLI binary compiles that .yml file into another .yml file.
// For example, it copies orbs into the file and evaluates the job parameters.
export default function getProcessedConfig(configFilePath: string): string {
  const { stdout, stderr } = cp.spawn(
    '/bin/sh',
    ['-c', `cat ${configFilePath} | ${getBinaryPath()} config process -`],
    getSpawnOptions()
  );

  if (!stdout) {
    throw new Error(stderr?.toString() ?? 'Failed to process the config');
  }

  return stdout.toString().trim();
}
