import * as fs from 'fs';
import getConfig from './getConfig';

export default function getConfigFromPath(configFilePath: string): CiConfig {
  return fs.existsSync(configFilePath)
    ? getConfig(fs.readFileSync(configFilePath, 'utf8'))
    : undefined;
}
