import type vscode from 'vscode';
import type { Command } from 'command/index';
import Complain from 'command/Complain';
import ConfigFile from 'config/ConfigFile';
import CreateConfigFile from 'command/CreateConfigFile';
import Delayer from 'job/Delayer';
import DebugRepo from 'command/DebugRepo';
import EditorGateway from 'gateway/EditorGateway';
import EnterToken from 'command/EnterToken';
import ExitAllJobs from 'command/ExitAllJobs';
import ExitJob from 'command/ExitJob';
import Help from 'command/Help';
import JobProvider from 'job/JobProvider';
import LogProviderFactory from 'log/LogProviderFactory';
import SelectRepo from 'command/SelectRepo';
import Refresh from '../command/Refresh';
import ReRunJob from 'command/ReRunJob';
import RunJob from 'command/RunJob';
import RunWalkthroughJob from 'command/RunWalkthroughJob';
import ShowLogFile from 'command/ShowLogFile';
import StartDocker from 'command/StartDocker';
import TryProcessAgain from '../command/TryProcessAgain';

import { EXTENSION_ID, JOB_TREE_VIEW_ID, LOG_FILE_SCHEME } from 'constant';

export default class Registrar {
  constructor(
    public context: vscode.ExtensionContext,
    public jobProvider: JobProvider,
    private complain: Complain,
    private configFile: ConfigFile,
    private createConfigFile: CreateConfigFile,
    private debugRepo: DebugRepo,
    private editorGateway: EditorGateway,
    private enterToken: EnterToken,
    private exitAllJobs: ExitAllJobs,
    private exitJob: ExitJob,
    private help: Help,
    private logProviderFactory: LogProviderFactory,
    private refresh: Refresh,
    private reRunJob: ReRunJob,
    private runJob: RunJob,
    private runWalkthroughJob: RunWalkthroughJob,
    private selectRepo: SelectRepo,
    private showLogFile: ShowLogFile,
    private startDocker: StartDocker,
    private tryProcessAgain: TryProcessAgain
  ) {}

  registerCommands(): vscode.Disposable[] {
    return [
      this.complain,
      this.createConfigFile,
      this.debugRepo,
      this.enterToken,
      this.exitAllJobs,
      this.exitJob,
      this.help,
      this.refresh,
      this.reRunJob,
      this.runJob,
      this.runWalkthroughJob,
      this.selectRepo,
      this.showLogFile,
      this.startDocker,
      this.tryProcessAgain,
    ].map((command: Command) => {
      return this.editorGateway.editor.commands.registerCommand(
        command.commandName,
        command.getCallback(this.context, this.jobProvider)
      );
    });
  }

  registerProviders() {
    return [
      this.editorGateway.editor.window.createTreeView(JOB_TREE_VIEW_ID, {
        treeDataProvider: this.jobProvider,
      }),
      this.editorGateway.editor.window.registerTreeDataProvider(
        JOB_TREE_VIEW_ID,
        this.jobProvider
      ),
      this.editorGateway.editor.workspace.registerTextDocumentContentProvider(
        LOG_FILE_SCHEME,
        this.logProviderFactory.create()
      ),
    ];
  }

  registerHandlers() {
    this.editorGateway.editor.window.registerUriHandler({
      handleUri: (uri: vscode.Uri) => {
        // vscode://LocalCI.local-ci/walkthrough
        if (uri.path === '/walkthrough') {
          this.editorGateway.editor.commands.executeCommand(
            'workbench.action.openWalkthrough',
            `${EXTENSION_ID}#welcomeLocalCi`
          );
        }
      },
    });

    this.editorGateway.editor.workspace.onDidSaveTextDocument(
      async (textDocument: vscode.TextDocument): Promise<void> => {
        if (
          textDocument.uri.fsPath.endsWith('.circleci/config.yml') &&
          textDocument.uri.fsPath ===
            (await this.configFile.getPath(this.context))
        ) {
          new Delayer(2000).trigger(() =>
            this.jobProvider.hardRefresh(undefined, true)
          );
        }
      }
    );
  }
}
