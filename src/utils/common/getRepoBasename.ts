import * as path from 'path';
import getRepoPath from './getRepoPath';

/**
 * Gets the basename of the repo.
 *
 * A slug, like 'vscode-foobar'.
 */
export default function getRepoBasename(configFilePath: string): string {
  return path.basename(getRepoPath(configFilePath));
}
