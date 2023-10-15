import { addEnvVars } from 'script';
import ChildProcessGateway from 'gateway/ChildProcessGateway';
import Spawn from 'common/Spawn';

export default class EnvVar {
  constructor(
    public childProcessGateway: ChildProcessGateway,
    public spawn: Spawn
  ) {}

  getStep(repoPath: string) {
    let command;
    try {
      const exportVars = this.childProcessGateway.cp
        .execSync(addEnvVars, {
          ...this.spawn.getOptions(repoPath),
          timeout: 2000,
        })
        .toString();

      command = `echo '${exportVars}' >> $BASH_ENV`;
    } catch (error) {
      command = `echo "There was an error setting the variables: ${
        (error as ErrorWithMessage).message
      }"`;
    }

    return {
      run: {
        name: 'Set more environment variables command',
        command,
      },
    };
  }
}
