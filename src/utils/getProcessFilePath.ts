import * as path from 'path';
import { PROCESS_FILE_DIRECTORY } from '../constants';
import getRootPath from './getRootPath';

// Gets the absolute path to the process .yml file for this workspace.
export default function getProcessFilePath(): string {
  return path.join(
    PROCESS_FILE_DIRECTORY,
    `${path.basename(getRootPath() || 'unknown')}.yml`
  );
}
