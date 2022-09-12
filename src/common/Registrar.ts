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
import ReRunJob from 'command/ReRunJob';
import {
  JOB_TREE_VIEW_ID,
  LICENSE_TREE_VIEW_ID,
  LOG_FILE_SCHEME,
} from 'constants/';
import LicenseInput from 'license/LicenseInput';
import RunWalkthroughJob from 'command/RunWalkthroughJob';
import LogProviderFactory from 'log/LogProviderFactory';
import Delayer from 'job/Delayer';
import ConfigFile from 'config/ConfigFile';
import CreateConfigFile from 'command/CreateConfigFile';
import EnterLicense from 'command/EnterLicense';
import GetLicense from 'command/GetLicense';
import FirstActivation from 'job/FirstActivation';
import DebugRepo from 'command/DebugRepo';
import Help from 'command/Help';
import RefreshLicenseTree from 'command/RefreshLicenseTree';
import ShowLogFile from 'command/ShowLogFile';

export default class Registrar {
  constructor(
    private context: vscode.ExtensionContext,
    private jobProvider: JobProvider,
    private licenseProvider: LicenseProvider,
    private firstActivation: FirstActivation,
    private configFile: ConfigFile,
    private debugRepo: DebugRepo,
    private createConfigFile: CreateConfigFile,
    private getLicense: GetLicense,
    private licenseInput: LicenseInput,
    private editorGateway: EditorGateway,
    private enterLicense: EnterLicense,
    private help: Help,
    private logProviderFactory: LogProviderFactory,
    private enterToken: EnterToken,
    private exitAllJobs: ExitAllJobs,
    private exitJob: ExitJob,
    private refresh: Refresh,
    private refreshLicenseTree: RefreshLicenseTree,
    private reRunJob: ReRunJob,
    private runJob: RunJob,
    private runWalkthroughJob: RunWalkthroughJob,
    private selectRepo: SelectRepo,
    private showLogFile: ShowLogFile,
    private tryProcessAgain: TryProcessAgain
  ) {}

  registerCommands(): vscode.Disposable[] {
    return [
      this.createConfigFile,
      this.debugRepo,
      this.enterLicense,
      this.enterToken,
      this.exitAllJobs,
      this.exitJob,
      this.getLicense,
      this.help,
      this.refresh,
      this.refreshLicenseTree,
      this.reRunJob,
      this.runJob,
      this.runWalkthroughJob,
      this.selectRepo,
      this.showLogFile,
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

  registerProviders() {
    return [
      this.editorGateway.editor.window.registerTreeDataProvider(
        JOB_TREE_VIEW_ID,
        this.jobProvider
      ),
      this.editorGateway.editor.window.registerWebviewViewProvider(
        LICENSE_TREE_VIEW_ID,
        this.licenseProvider
      ),
      this.editorGateway.editor.window.createTreeView(JOB_TREE_VIEW_ID, {
        treeDataProvider: this.jobProvider,
      }),
      this.editorGateway.editor.workspace.registerTextDocumentContentProvider(
        LOG_FILE_SCHEME,
        this.logProviderFactory.create()
      ),
    ];
  }

  /**
   * Entering this URI in the browser will show the license key input:
   *
   * vscode://LocalCI.local-ci/enterLicense
   */
  registerHandlers() {
    this.firstActivation.handle(this.context);

    this.editorGateway.editor.window.registerUriHandler({
      handleUri: (uri: vscode.Uri) => {
        if (uri.path === '/enterLicense') {
          this.licenseInput.show(
            this.context,
            () => this.licenseProvider.load(),
            () => this.jobProvider.hardRefresh()
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
