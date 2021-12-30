import getConfig from './getConfig';
import getConfigFromPath from './getConfigFromPath';
import getDynamicConfigFilePath from './getDynamicConfigFilePath';
import getJobs from './getJobs';

export default function getAllJobs(
  processedConfig: string,
  configFilePath: string
): Map<string, string[] | null> {
  // https://circleci.com/docs/2.0/dynamic-config/
  const dynamicConfigJobs = getJobs(
    getConfigFromPath(getDynamicConfigFilePath(configFilePath))
  );
  const originalJobs = getJobs(getConfig(processedConfig));

  return dynamicConfigJobs.size
    ? new Map([...originalJobs, ...dynamicConfigJobs])
    : originalJobs;
}
