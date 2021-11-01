import * as path from 'path';
import { LOCAL_VOLUME_DIRECTORY } from '../constants';
import getRepoBasename from './getRepoBasename';

// Gets the absolute path to the local volume that stores the workspace between jobs.
// The configFilePath must end in ./cirleci/config.yml.
export default function getLocalVolumePath(configFilePath: string): string {
  return path.join(
    LOCAL_VOLUME_DIRECTORY,
    configFilePath ? getRepoBasename(configFilePath) : 'unknown'
  );
}
