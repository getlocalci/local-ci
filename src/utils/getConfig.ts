import * as yaml from 'js-yaml';

export default function getConfig(processedConfig: string): CiConfig {
  return yaml.load(processedConfig) as CiConfig;
}
