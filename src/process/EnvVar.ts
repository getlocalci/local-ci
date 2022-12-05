import { injectable, inject } from 'inversify';
import Types from 'common/Types';
import { addEnvVars } from 'script';
import ChildProcessGateway from 'gateway/ChildProcessGateway';
import Spawn from 'common/Spawn';

@injectable()
export default class EnvVar {
  @inject(Types.IChildProcessGateway)
  childProcessGateway!: ChildProcessGateway;

  @inject(Spawn)
  spawn!: Spawn;

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
