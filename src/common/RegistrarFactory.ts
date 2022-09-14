import { inject, injectable } from 'inversify';
import type vscode from 'vscode';
import Types from 'common/Types';
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
import TryProcessAgain from '../command/TryProcessAgain';

@injectable()
export default class RegistrarFactory {
  constructor(
    @inject(ConfigFile) private configFile: ConfigFile,
    @inject(CreateConfigFile) private createConfigFile: CreateConfigFile,
    @inject(DebugRepo) private debugRepo: DebugRepo,
    @inject(EnterLicense) private enterLicense: EnterLicense,
    @inject(EnterToken) private enterToken: EnterToken,
    @inject(ExitAllJobs) private exitAllJobs: ExitAllJobs,
    @inject(ExitJob) private exitJob: ExitJob,
    @inject(FirstActivation) private firstActivation: FirstActivation,
    @inject(GetLicense) private getLicense: GetLicense,
    @inject(Help) private help: Help,
    @inject(LicenseInput) private licenseInput: LicenseInput,
    @inject(LogProviderFactory) private logProviderFactory: LogProviderFactory,
    @inject(Refresh) private refresh: Refresh,
    @inject(RefreshLicenseTree) private refreshLicenseTree: RefreshLicenseTree,
    @inject(ReRunJob) private reRunJob: ReRunJob,
    @inject(RunJob) private runJob: RunJob,
    @inject(RunWalkthroughJob) private runWalkthroughJob: RunWalkthroughJob,
    @inject(SelectRepo) private selectRepo: SelectRepo,
    @inject(ShowLogFile) private showLogFile: ShowLogFile,
    @inject(TryProcessAgain) private tryProcessAgain: TryProcessAgain,
    @inject(Types.IEditorGateway) private editorGateway: EditorGateway
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
      this.tryProcessAgain
    );
  }
}
