import { inject, injectable } from 'inversify';
import getConfig from 'config/getConfig';
import getDynamicConfigPath from 'config/getDynamicConfigPath';
import getJobs from './getJobs';
import ParsedConfig from 'config/ParsedConfig';

@injectable()
export default class AllJobs {
  @inject(ParsedConfig)
  parsedConfig!: ParsedConfig;

  get(
    processedConfig: string,
    configFilePath: string
  ): Map<string, string[] | null> {
    // https://circleci.com/docs/2.0/dynamic-config/
    const dynamicConfigJobs = getJobs(
      this.parsedConfig.get(getDynamicConfigPath(configFilePath))
    );
    const originalJobs = getJobs(getConfig(processedConfig));

    return dynamicConfigJobs.size
      ? new Map([...originalJobs, ...dynamicConfigJobs])
      : originalJobs;
  }
}
