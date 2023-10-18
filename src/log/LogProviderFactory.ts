import FsGateway from 'gateway/FsGateway';
import LogProvider from './LogProvider';

export default class LogProviderFactory {
  constructor(public fsGateway: FsGateway) {}

  create() {
    return new LogProvider(this.fsGateway);
  }
}
