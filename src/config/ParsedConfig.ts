import { inject, injectable } from 'inversify';
import getConfig from './getConfig';
import FsGateway from 'gateway/FsGateway';
import Types from 'common/Types';

@injectable()
export default class ParsedConfig {
  @inject(Types.IFsGateway)
  fsGateway!: FsGateway;

  get(configFilePath: string): CiConfig {
    return this.fsGateway.fs.existsSync(configFilePath)
      ? getConfig(this.fsGateway.fs.readFileSync(configFilePath, 'utf8'))
      : undefined;
  }
}
