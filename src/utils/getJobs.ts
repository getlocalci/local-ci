import getConfigFile from './getConfigFile';

export default function getJobs(configFilePath: string): string[] | [] {
  return Object.keys(getConfigFile(configFilePath)?.jobs ?? {});
}
