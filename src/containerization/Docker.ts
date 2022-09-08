import { decorate, inject, injectable } from 'inversify';

import Spawn from 'common/Spawn';
import Types from 'common/Types';
import ChildProcessGateway from 'common/ChildProcessGateway';

class Docker {
  childProcessGateway!: ChildProcessGateway;
  spawn!: Spawn;

  getError(): string {
    try {
      this.childProcessGateway.cp.execSync('docker info', {
        ...this.spawn.getOptions(),
        timeout: 2000,
      });
    } catch (error) {
      return (error as ErrorWithMessage)?.message ?? '';
    }

    return '';
  }

  isRunning(): boolean {
    return !this.getError()?.length;
  }
}

decorate(injectable(), Docker);
decorate(
  inject(Types.IChildProcessGateway),
  Docker.prototype,
  'childProcessGateway'
);
decorate(inject(Spawn), Docker.prototype, 'spawn');

export default Docker;
