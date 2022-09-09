import { inject, injectable } from 'inversify';
import EnvPath from './EnvPath';
import Workspace from './Workspace';

@injectable()
export default class Spawn {
  @inject(EnvPath)
  envPath!: EnvPath;

  @inject(Workspace)
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
