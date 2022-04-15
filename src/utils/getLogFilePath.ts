import * as path from 'path';
import getlogFilesDirectory from './getLogFilesDirectory';

/** Gets the absolute path to the log file for a job. */
export default function getlogFilePath(
  fullPathToConfigFile: string,
  jobName: string,
  fileName?: string
) {
  return path.join(
    getlogFilesDirectory(fullPathToConfigFile, jobName),
    fileName || `${Date.now()}.log`
  );
}
