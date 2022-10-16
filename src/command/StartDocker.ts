import { inject, injectable } from 'inversify';
import type vscode from 'vscode';
import type { Command } from '.';
import { START_DOCKER_COMMAND } from 'constant';
import Types from 'common/Types';
import ChildProcessGateway from 'gateway/ChildProcessGateway';
import CommandTreeItem from 'job/CommandTreeItem';
import Spawn from 'common/Spawn';
import EnvPath from 'common/EnvPath';
import EditorGateway from 'gateway/EditorGateway';
import JobProvider from 'job/JobProvider';

@injectable()
export default class StartDocker implements Command {
  @inject(Types.IChildProcessGateway)
  childProcessGateway!: ChildProcessGateway;

  @inject(Types.IEditorGateway)
  editorGateway!: EditorGateway;

  @inject(EnvPath)
  envPath!: EnvPath;

  @inject(Spawn)
  spawn!: Spawn;

  commandName: string;

  constructor() {
    this.commandName = START_DOCKER_COMMAND;
  }

  getCallback(context: vscode.ExtensionContext, jobProvider: JobProvider) {
    return async (commandTreeItem: CommandTreeItem) => {
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
