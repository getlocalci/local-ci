import * as path from 'path';
import getRepoPath from 'common/getRepoBasename';
import { HOST_TMP_DIRECTORY } from 'constant';

/** Gets the absolute path to the dynamic config process .yml file for this workspace. */
export default function getDynamicConfigProcessFilePath(
  fullPathToConfigFile: string
): string {
  return path.join(
    HOST_TMP_DIRECTORY,
    getRepoPath(fullPathToConfigFile),
    'dynamic-config-process.yml'
  );
}
