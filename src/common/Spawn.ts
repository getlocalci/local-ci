import { inject, injectable } from 'inversify';
import EnvPath from './EnvPath';
import ProcessGateway from './ProcessGateway';
import Workspace from './Workspace';

@injectable()
export default class Spawn {
  @inject(EnvPath)
  envPath!: EnvPath;

  @inject(Workspace)
  workspace!: Workspace;

  @inject(ProcessGateway)
  processGateway!: ProcessGateway;

  getOptions(cwd?: string): SpawnOptions {
    return {
      cwd: cwd || this.workspace.getFirstWorkspaceRootPath(),
      env: {
        ...this.processGateway.process.env,
        PATH: this.envPath.get(),
      },
    };
  }
}
