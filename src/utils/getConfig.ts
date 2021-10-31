import * as fs from 'fs';
import * as yaml from 'js-yaml';

export default function getConfig(configFilePath: string): CiConfig {
  return fs.existsSync(configFilePath)
    ? (yaml.load(fs.readFileSync(configFilePath, 'utf8')) as CiConfig)
    : null;
}
