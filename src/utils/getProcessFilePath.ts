import * as path from 'path';
import { PROCESS_FILE_DIRECTORY } from '../constants';
import getRepoPath from './getRepoBasename';

// Gets the absolute path to the process .yml file for this workspace.
export default function getProcessFilePath(
  fullPathToConfigFile: string
): string {
  return path.join(
    PROCESS_FILE_DIRECTORY,
    `${getRepoPath(fullPathToConfigFile)}.yml`
  );
}
