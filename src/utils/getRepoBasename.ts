import * as path from 'path';
import getRepoPath from './getRepoPath';

// Gets the basename of the repo.
// Like a slug, for example, 'vscode-foobar'.
export default function getRepoBasename(configFilePath: string): string {
  return path.basename(getRepoPath(configFilePath));
}
