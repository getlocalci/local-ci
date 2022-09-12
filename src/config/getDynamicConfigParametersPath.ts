import * as path from 'path';
import getLocalVolumePath from 'containerization/getLocalVolumePath';
import { DYNAMIC_CONFIG_PARAMETERS_FILE_NAME } from 'constant';

/**
 * Gets the absolute path to the dynamic config file, though the file may not exist.
 *
 * The configFilePath parameter is the path to the chosen .circleci/config.yml file,
 * which itself is not a generated dynamic config file.
 * That is passed because there could be several of those files in a workspace,
 * and the user only selects one at a time.
 */
export default function getDynamicConfigParametersPath(
  configFilePath: string
): string {
  return path.join(
    getLocalVolumePath(configFilePath),
    DYNAMIC_CONFIG_PARAMETERS_FILE_NAME
  );
}
