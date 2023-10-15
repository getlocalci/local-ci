import EnvPath from './EnvPath';
import ProcessGateway from 'gateway/ProcessGateway';
import Workspace from './Workspace';

export default class Spawn {
  constructor(
    public envPath: EnvPath,
    public processGateway: ProcessGateway,
    public workspace: Workspace
  ) {}

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
