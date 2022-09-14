import * as path from 'path';
import getRepoBasename from 'common/getRepoBasename';
import { HOST_TMP_DIRECTORY } from 'constant';

/**
 * Gets the absolute path to the local volume that stores the CI workspace between jobs.
 *
 * The configFilePath must end in ./cirleci/config.yml.
 */
export default function getLocalVolumePath(configFilePath: string): string {
  return path.join(
    HOST_TMP_DIRECTORY,
    configFilePath ? getRepoBasename(configFilePath) : 'unknown',
    'volume'
  );
}
