import { inject, injectable } from 'inversify';
import Types from 'common/Types';
import FsGateway from 'gateway/FsGateway';
import getConfig from './getConfig';

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
