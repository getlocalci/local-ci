import * as path from 'path';

/*
 * Gets the absolute path of the repo that CI will run on.
 *
 * The configFilePath must end in .circleci/config.yml.
 */
export default function getRepoPath(configFilePath: string): string {
  return path.dirname(path.dirname(configFilePath));
}
