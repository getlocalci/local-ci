import * as path from 'path';
import { HOST_TMP_DIRECTORY } from '../constants';
import getRepoPath from './getRepoBasename';

/** Gets the log files directory for the log file(s) for a job. */
export default function getLogFilesDirectory(
  fullPathToConfigFile: string,
  jobName: string
) {
  return path.join(
    HOST_TMP_DIRECTORY,
    getRepoPath(fullPathToConfigFile),
    'logs',
    jobName
  );
}
