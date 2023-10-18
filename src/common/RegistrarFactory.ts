import type vscode from 'vscode';
import Complain from 'command/Complain';
import ConfigFile from 'config/ConfigFile';
import CreateConfigFile from 'command/CreateConfigFile';
import DebugRepo from 'command/DebugRepo';
import EditorGateway from 'gateway/EditorGateway';
import EnterLicense from 'command/EnterLicense';
import EnterToken from 'command/EnterToken';
import ExitAllJobs from 'command/ExitAllJobs';
import ExitJob from 'command/ExitJob';
import FirstActivation from 'job/FirstActivation';
import GetLicense from 'command/GetLicense';
import Help from 'command/Help';
import JobProvider from 'job/JobProvider';
import LicenseInput from 'license/LicenseInput';
import LogProviderFactory from 'log/LogProviderFactory';
import LicenseProvider from 'license/LicenseProvider';
import Registrar from './Registrar';
import RunJob from 'command/RunJob';
import ReRunJob from 'command/ReRunJob';
import RunWalkthroughJob from 'command/RunWalkthroughJob';
import Refresh from '../command/Refresh';
import RefreshLicenseTree from 'command/RefreshLicenseTree';
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
    private enterLicense: EnterLicense,
    private enterToken: EnterToken,
    private exitAllJobs: ExitAllJobs,
    private exitJob: ExitJob,
    private firstActivation: FirstActivation,
    private getLicense: GetLicense,
    private help: Help,
    private licenseInput: LicenseInput,
    private logProviderFactory: LogProviderFactory,
    private refresh: Refresh,
    private refreshLicenseTree: RefreshLicenseTree,
    private reRunJob: ReRunJob,
    private runJob: RunJob,
    private runWalkthroughJob: RunWalkthroughJob,
    private selectRepo: SelectRepo,
    private showLogFile: ShowLogFile,
    private startDocker: StartDocker,
    private tryProcessAgain: TryProcessAgain,
    private editorGateway: EditorGateway
  ) {}

  create(
    context: vscode.ExtensionContext,
    jobProvider: JobProvider,
    licenseProvider: LicenseProvider
  ) {
    return new Registrar(
      context,
      jobProvider,
      licenseProvider,
      this.complain,
      this.configFile,
      this.createConfigFile,
      this.debugRepo,
      this.editorGateway,
      this.enterLicense,
      this.enterToken,
      this.exitAllJobs,
      this.exitJob,
      this.firstActivation,
      this.getLicense,
      this.help,
      this.licenseInput,
      this.logProviderFactory,
      this.refresh,
      this.refreshLicenseTree,
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
