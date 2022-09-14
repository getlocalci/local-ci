import { inject, injectable } from 'inversify';
import ChildProcessGateway from 'gateway/ChildProcessGateway';
import OsGateway from 'gateway/OsGateway';
import Spawn from 'common/Spawn';
import Types from 'common/Types';
import { writeBuildAgentSettings } from 'script';

@injectable()
export default class BuildAgentSettings {
  @inject(Types.IChildProcessGateway)
  childProcessGateway!: ChildProcessGateway;

  @inject(Types.IOsGateway)
  osGateway!: OsGateway;

  @inject(Spawn)
  spawn!: Spawn;

  set() {
    if (!this.isIntelMac()) {
      return;
    }

    this.childProcessGateway.cp.spawn(
      '/bin/sh',
      ['-c', writeBuildAgentSettings],
      {
        ...this.spawn.getOptions(),
        timeout: 5000,
      }
    );
  }

  isIntelMac() {
    return (
      this.osGateway.os.type() === 'Darwin' &&
      this.osGateway.os.arch() === 'x64'
    );
  }
}
