import * as path from 'path';
import { HOST_TMP_PATH } from '../constants';
import getRepoPath from './getRepoBasename';

// Gets the absolute path to the local volume that stores the workspace between jobs.
// The configFilePath must end in ./cirleci/config.yml.
export default function getLocalVolumePath(configFilePath: string): string {
  return path.join(
    HOST_TMP_PATH,
    'volume',
    configFilePath ? getRepoPath(configFilePath) : 'unknown'
  );
}
