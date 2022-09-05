import { decorate, inject, injectable } from 'inversify';
import getPath from './getPath';
import Workspace from './Workspace';

class Spawn {
  workspace!: Workspace;

  getOptions(cwd?: string): SpawnOptions {
    return {
      cwd: cwd || this.workspace.getFirstWorkspaceRootPath(),
      env: {
        ...process.env,
        PATH: getPath(),
      },
    };
  }
}

decorate(injectable(), Spawn);
decorate(inject(Workspace), Spawn.prototype, 'workspace');

export default Spawn;
