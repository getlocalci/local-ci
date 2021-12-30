import * as path from 'path';
import getConfig from './getConfig';
import getConfigFromPath from './getConfigFromPath';
import getJobs from './getJobs';
import getLocalVolumePath from './getLocalVolumePath';

export default function getAllJobs(
  processedConfig: string,
  configFilePath: string
): Map<string, string[] | null> {
  // https://circleci.com/docs/2.0/dynamic-config/
  const dynamicConfigJobs = getJobs(
    getConfigFromPath(
      path.join(getLocalVolumePath(configFilePath), 'config.yml')
    )
  );
  const originalJobs = getJobs(getConfig(processedConfig));

  return dynamicConfigJobs.size
    ? new Map([...originalJobs, ...dynamicConfigJobs])
    : originalJobs;
}
