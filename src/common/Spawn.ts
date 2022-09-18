import { inject, injectable } from 'inversify';
import EnvPath from './EnvPath';
import ProcessGateway from 'gateway/ProcessGateway';
import Workspace from './Workspace';

@injectable()
export default class Spawn {
  @inject(EnvPath)
  envPath!: EnvPath;

  @inject(ProcessGateway)
  processGateway!: ProcessGateway;

  @inject(Workspace)
  workspace!: Workspace;

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
