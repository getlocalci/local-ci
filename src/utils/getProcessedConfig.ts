import * as cp from 'child_process';
import * as yaml from 'js-yaml';
import { getBinaryPath } from '../../node/binary';
import getConfigFromPath from './getConfigFromPath';
import getSpawnOptions from './getSpawnOptions';
import replaceDynamicConfigOrb from './replaceDynamicConfigOrb';

// Gets the plain text of the processed .circleci/config.yml file.
// The CircleCI CLI binary compiles that .yml file into another .yml file.
// For example, it copies orbs into the file and evaluates the job parameters.
export default function getProcessedConfig(configFilePath: string): string {
  const config = replaceDynamicConfigOrb(getConfigFromPath(configFilePath));
  const stdout = cp.execSync(
    `echo "${yaml.dump(config)}" | ${getBinaryPath()} config process -`,
    getSpawnOptions()
  );

  if (!stdout) {
    throw new Error('Failed to process the config');
  }

  return stdout.toString().trim();
}
