import * as path from 'path';

// Gets the absolute path of the repo that CI will run on.
export default function getRepoPath(configFilePath: string): string {
  return path.dirname(path.dirname(configFilePath));
}
