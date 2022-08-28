import * as path from 'path';
import { HOST_TMP_DIRECTORY } from 'constants/';
import getRepoPath from 'utils/common/getRepoBasename';

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
