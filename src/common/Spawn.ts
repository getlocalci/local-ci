import { decorate, inject, injectable } from 'inversify';
import EnvPath from './EnvPath';
import Workspace from './Workspace';

class Spawn {
  envPath!: EnvPath;
  workspace!: Workspace;

  getOptions(cwd?: string): SpawnOptions {
    return {
      cwd: cwd || this.workspace.getFirstWorkspaceRootPath(),
      env: {
        ...process.env,
        PATH: this.envPath.get(),
      },
    };
  }
}

decorate(injectable(), Spawn);
decorate(inject(EnvPath), Spawn.prototype, 'envPath');
decorate(inject(Workspace), Spawn.prototype, 'workspace');

export default Spawn;
