import * as path from 'path';
import getLocalVolumePath from './getLocalVolumePath';

// Gets the absolute path to the dynamic config file, which may or may not exist.
// The configFilePath parameter is the path to the chosen .circleci/config.yml file,
// which itself is not a dynamic config file.
// That is passed because there could be several of those files in a workspace.
export default function getDynamicConfigFilePath(
  configFilePath: string
): string {
  return path.join(getLocalVolumePath(configFilePath), 'config.yml');
}
