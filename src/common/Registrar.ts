import EnterToken from 'command/EnterToken';
import ExitAllJobs from 'command/ExitAllJobs';
import SelectRepo from 'command/SelectRepo';
import EditorGateway from 'common/EditorGateway';
import JobProvider from 'job/JobProvider';
import type vscode from 'vscode';
import type { Command } from 'command/index';
import Refresh from '../command/Refresh';
import TryProcessAgain from '../command/TryProcessAgain';
import LicenseProvider from 'license/LicenseProvider';
import RunJob from 'command/RunJob';
import ExitJob from 'command/ExitJob';

export default class Registrar {
  constructor(
    private context: vscode.ExtensionContext,
    private jobProvider: JobProvider,
    private licenseProvider: LicenseProvider,
    private editorGateway: EditorGateway,
    private enterToken: EnterToken,
    private exitAllJobs: ExitAllJobs,
    private exitJob: ExitJob,
    private refresh: Refresh,
    private runJob: RunJob,
    private selectRepo: SelectRepo,
    private tryProcessAgain: TryProcessAgain
  ) {}

  registerCommands(): vscode.Disposable[] {
    return [
      this.enterToken,
      this.exitAllJobs,
      this.exitJob,
      this.refresh,
      this.runJob,
      this.selectRepo,
      this.tryProcessAgain,
    ].map((command: Command) => {
      return this.editorGateway.editor.commands.registerCommand(
        command.commandName,
        command.getCallback(
          this.context,
          this.jobProvider,
          this.licenseProvider
        )
      );
    });
  }
}
