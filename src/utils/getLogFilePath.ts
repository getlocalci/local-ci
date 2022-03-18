import * as path from 'path';
import { HOST_TMP_DIRECTORY } from '../constants';
import getRepoPath from './getRepoBasename';

/** Gets the absolute path to the log file for the job. */
export default function getlogFilePath(
  fullPathToConfigFile: string,
  jobName: string
) {
  return path.join(
    HOST_TMP_DIRECTORY,
    getRepoPath(fullPathToConfigFile),
    'logs',
    jobName,
    `${Date.now()}.log`
  );
}
