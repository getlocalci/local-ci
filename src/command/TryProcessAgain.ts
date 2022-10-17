import { inject, injectable } from 'inversify';
import type { Command } from '.';
import type vscode from 'vscode';
import ConfigFile from 'config/ConfigFile';
import FsGateway from 'gateway/FsGateway';
import getDynamicConfigPath from 'config/getDynamicConfigPath';
import JobProvider from 'job/JobProvider';
import Types from 'common/Types';
import { PROCESS_TRY_AGAIN_COMMAND } from 'constant';

@injectable()
export default class TryProcessAgain implements Command {
  @inject(ConfigFile)
  configFile!: ConfigFile;

  @inject(Types.IFsGateway)
  fsGateway!: FsGateway;

  commandName: string;

  constructor() {
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
