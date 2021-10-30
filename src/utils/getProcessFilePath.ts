import * as path from 'path';
import { PROCESS_FILE_DIRECTORY } from '../constants';

// Gets the absolute path to the process .yml file for this workspace.
export default function getProcessFilePath(
  fullPathToConfigFile: string
): string {
  return path.join(
    PROCESS_FILE_DIRECTORY,
    `${path.basename(path.dirname(path.dirname(fullPathToConfigFile)))}.yml`
  );
}
