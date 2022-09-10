import type { Command } from 'index';
import * as vscode from 'vscode';
import { PROCESS_TRY_AGAIN_COMMAND } from 'constants/';
import JobProvider from 'job/JobProvider';
import { inject, injectable } from 'inversify';
import FsGateway from 'common/FsGateway';
import Types from 'common/Types';
import ConfigFile from 'config/ConfigFile';
import getDynamicConfigPath from 'config/getDynamicConfigPath';

@injectable()
export default class TryProcessAgain implements Command {
  @inject(Types.IFsGateway)
  fsGateway!: FsGateway;

  @inject(ConfigFile)
  configFile!: ConfigFile;

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
