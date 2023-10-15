import ChildProcessGateway from 'gateway/ChildProcessGateway';
import OsGateway from 'gateway/OsGateway';
import Spawn from 'common/Spawn';
import { writeBuildAgentSettings } from 'script';

export default class BuildAgentSettings {
  constructor(
    public childProcessGateway: ChildProcessGateway,
    public osGateway: OsGateway,
    public spawn: Spawn
  ) {}

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
