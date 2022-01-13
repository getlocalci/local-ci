import * as path from 'path';
import getLocalVolumePath from './getLocalVolumePath';
import { DYNAMIC_CONFIG_FILE_NAME } from '../constants';

/**
 * Gets the absolute path to the dynamic config file, though the file may not exist.
 *
 * The configFilePath parameter is the path to the chosen .circleci/config.yml file,
 * which itself is not a generated dynamic config file.
 * That is passed because there could be several of those files in a workspace,
 * and the user only selects one at a time.
 */
export default function getDynamicConfigPath(configFilePath: string): string {
  return path.join(
    getLocalVolumePath(configFilePath),
    DYNAMIC_CONFIG_FILE_NAME
  );
}
