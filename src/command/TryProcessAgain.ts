import type { Command } from '.';
import type vscode from 'vscode';
import ConfigFile from 'config/ConfigFile';
import FsGateway from 'gateway/FsGateway';
import getDynamicConfigPath from 'config/getDynamicConfigPath';
import JobProvider from 'job/JobProvider';
import { PROCESS_TRY_AGAIN_COMMAND } from 'constant';

export default class TryProcessAgain implements Command {
  commandName: string;

  constructor(public configFile: ConfigFile, public fsGateway: FsGateway) {
    this.commandName = PROCESS_TRY_AGAIN_COMMAND;
  }

  getCallback(context: vscode.ExtensionContext, jobProvider: JobProvider) {
    return async () => {
      // There might have been a problem with the dynamic config file, so remove it.
      const dynamicConfig = getDynamicConfigPath(
        await this.configFile.getPath(context)
      );

      if (this.fsGateway.fs.existsSync(dynamicConfig)) {
        this.fsGateway.fs.rmSync(dynamicConfig);
      }

      jobProvider.hardRefresh();
    };
  }
}
