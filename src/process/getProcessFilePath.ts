import * as path from 'path';
import getRepoPath from 'common/getRepoBasename';
import { HOST_TMP_DIRECTORY } from 'constant';

/** Gets the absolute path to the process .yml file for this workspace. */
export default function getProcessFilePath(
  fullPathToConfigFile: string
): string {
  return path.join(
    HOST_TMP_DIRECTORY,
    getRepoPath(fullPathToConfigFile),
    'process.yml'
  );
}
