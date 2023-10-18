import ChildProcessGateway from 'gateway/ChildProcessGateway';
import Spawn from 'common/Spawn';

class Docker {
  constructor(
    public childProcessGateway: ChildProcessGateway,
    public spawn: Spawn
  ) {}

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

export default Docker;
