import type vscode from 'vscode';
import type { Command } from '.';
import { START_DOCKER_COMMAND } from 'constant';
import ChildProcessGateway from 'gateway/ChildProcessGateway';
import CommandTreeItem from 'job/CommandTreeItem';
import Spawn from 'common/Spawn';
import EnvPath from 'common/EnvPath';
import JobProvider from 'job/JobProvider';

export default class StartDocker implements Command {
  commandName: string;

  constructor(
    public childProcessGateway: ChildProcessGateway,
    public envPath: EnvPath,
    public spawn: Spawn
  ) {
    this.commandName = START_DOCKER_COMMAND;
  }

  getCallback(context: vscode.ExtensionContext, jobProvider: JobProvider) {
    return (commandTreeItem: CommandTreeItem) => {
      commandTreeItem.setIsRunning();
      jobProvider.refresh(commandTreeItem);

      this.childProcessGateway.cp.spawn(
        '/bin/sh',
        [
          '-c',
          this.envPath.isMac()
            ? 'open -a Docker'
            : 'systemctl --user start docker-desktop',
        ],
        this.spawn.getOptions()
      );
    };
  }
}
