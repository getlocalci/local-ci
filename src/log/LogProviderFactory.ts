import { inject, injectable } from 'inversify';
import FsGateway from 'common/FsGateway';
import Types from 'common/Types';
import LogProvider from './LogProvider';

@injectable()
export default class LogProviderFactory {
  @inject(Types.IFsGateway)
  fsGateway!: FsGateway;

  create() {
    return new LogProvider(this.fsGateway);
  }
}
