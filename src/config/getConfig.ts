import * as yaml from 'js-yaml';

export default function getConfig(unparsedFile: string): CiConfig {
  return yaml.load(unparsedFile) as CiConfig;
}
