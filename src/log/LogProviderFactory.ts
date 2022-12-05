import { inject, injectable } from 'inversify';
import Types from 'common/Types';
import FsGateway from 'gateway/FsGateway';
import LogProvider from './LogProvider';

@injectable()
export default class LogProviderFactory {
  @inject(Types.IFsGateway)
  fsGateway!: FsGateway;

  create() {
    return new LogProvider(this.fsGateway);
  }
}
