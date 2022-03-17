import * as path from 'path';
import { HOST_TMP_DIRECTORY } from '../constants';
import getRepoPath from './getRepoBasename';

// Gets the absolute path to the result file for the job.
export default function getResultFilePath(
  fullPathToConfigFile: string,
  jobName: string
) {
  return path.join(
    HOST_TMP_DIRECTORY,
    getRepoPath(fullPathToConfigFile),
    'result',
    jobName,
    'result.log'
  );
}
