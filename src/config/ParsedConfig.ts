import FsGateway from 'gateway/FsGateway';
import getConfig from './getConfig';

export default class ParsedConfig {
  constructor(public fsGateway: FsGateway) {}

  get(configFilePath: string): CiConfig {
    return this.fsGateway.fs.existsSync(configFilePath)
      ? getConfig(this.fsGateway.fs.readFileSync(configFilePath, 'utf8'))
      : undefined;
  }
}
