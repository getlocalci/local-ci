import type vscode from 'vscode';
import Complain from 'command/Complain';
import ConfigFile from 'config/ConfigFile';
import CreateConfigFile from 'command/CreateConfigFile';
import DebugRepo from 'command/DebugRepo';
import EditorGateway from 'gateway/EditorGateway';
import EnterToken from 'command/EnterToken';
import ExitAllJobs from 'command/ExitAllJobs';
import ExitJob from 'command/ExitJob';
import Help from 'command/Help';
import JobProvider from 'job/JobProvider';
import LogProviderFactory from 'log/LogProviderFactory';
import Registrar from './Registrar';
import RunJob from 'command/RunJob';
import ReRunJob from 'command/ReRunJob';
import RunWalkthroughJob from 'command/RunWalkthroughJob';
import Refresh from '../command/Refresh';
import SelectRepo from 'command/SelectRepo';
import ShowLogFile from 'command/ShowLogFile';
import StartDocker from 'command/StartDocker';
import TryProcessAgain from '../command/TryProcessAgain';

export default class RegistrarFactory {
  constructor(
    private complain: Complain,
    private configFile: ConfigFile,
    private createConfigFile: CreateConfigFile,
    private debugRepo: DebugRepo,
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
    private tryProcessAgain: TryProcessAgain,
    private editorGateway: EditorGateway
  ) {}

  create(context: vscode.ExtensionContext, jobProvider: JobProvider) {
    return new Registrar(
      context,
      jobProvider,
      this.complain,
      this.configFile,
      this.createConfigFile,
      this.debugRepo,
      this.editorGateway,
      this.enterToken,
      this.exitAllJobs,
      this.exitJob,
      this.help,
      this.logProviderFactory,
      this.refresh,
      this.reRunJob,
      this.runJob,
      this.runWalkthroughJob,
      this.selectRepo,
      this.showLogFile,
      this.startDocker,
      this.tryProcessAgain
    );
  }
}
