import * as fs from 'fs';
import * as yaml from 'js-yaml';

export default function getConfigFile(configFilePath: string): ConfigFile {
  return yaml.load(fs.readFileSync(configFilePath, 'utf8')) as ConfigFile;
}
