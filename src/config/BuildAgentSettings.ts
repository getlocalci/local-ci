import { inject, injectable } from 'inversify';
import Spawn from 'common/Spawn';
import OsGateway from 'gateway/OsGateway';
import Types from 'common/Types';
import ChildProcessGateway from 'gateway/ChildProcessGateway';
import { writeBuildAgentSettings } from 'scripts/';

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
