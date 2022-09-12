import { inject, injectable } from 'inversify';
import EnterToken from 'command/EnterToken';
import ExitAllJobs from 'command/ExitAllJobs';
import SelectRepo from 'command/SelectRepo';
import EditorGateway from 'gateway/EditorGateway';
import Types from 'common/Types';
import JobProvider from 'job/JobProvider';
import type vscode from 'vscode';
import Refresh from '../command/Refresh';
import TryProcessAgain from '../command/TryProcessAgain';
import LicenseProvider from 'license/LicenseProvider';
import Registrar from './Registrar';
import RunJob from 'command/RunJob';
import ExitJob from 'command/ExitJob';
import ReRunJob from 'command/ReRunJob';
import LicenseInput from 'license/LicenseInput';
import RunWalkthroughJob from 'command/RunWalkthroughJob';
import LogProviderFactory from 'log/LogProviderFactory';
import ConfigFile from 'config/ConfigFile';
import CreateConfigFile from 'command/CreateConfigFile';
import EnterLicense from 'command/EnterLicense';
import GetLicense from 'command/GetLicense';
import FirstActivation from 'job/FirstActivation';
import DebugRepo from 'command/DebugRepo';
import Help from 'command/Help';
import RefreshLicenseTree from 'command/RefreshLicenseTree';
import ShowLogFile from 'command/ShowLogFile';

@injectable()
export default class RegistrarFactory {
  constructor(
    @inject(Types.IEditorGateway) private editorGateway: EditorGateway,
    @inject(ConfigFile) private configFile: ConfigFile,
    @inject(DebugRepo) private debugRepo: DebugRepo,
    @inject(CreateConfigFile) private createConfigFile: CreateConfigFile,
    @inject(FirstActivation) private firstActivation: FirstActivation,
    @inject(GetLicense) private getLicense: GetLicense,
    @inject(Help) private help: Help,
    @inject(LogProviderFactory) private logProviderFactory: LogProviderFactory,
    @inject(EnterLicense) private enterLicense: EnterLicense,
    @inject(EnterToken) private enterToken: EnterToken,
    @inject(ExitAllJobs) private exitAllJobs: ExitAllJobs,
    @inject(ExitJob) private exitJob: ExitJob,
    @inject(LicenseInput) private licenseInput: LicenseInput,
    @inject(Refresh) private refresh: Refresh,
    @inject(RefreshLicenseTree) private refreshLicenseTree: RefreshLicenseTree,
    @inject(ReRunJob) private reRunJob: ReRunJob,
    @inject(RunJob) private runJob: RunJob,
    @inject(ShowLogFile) private showLogFile: ShowLogFile,
    @inject(RunWalkthroughJob) private runWalkthroughJob: RunWalkthroughJob,
    @inject(SelectRepo) private selectRepo: SelectRepo,
    @inject(TryProcessAgain) private tryProcessAgain: TryProcessAgain
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
      this.firstActivation,
      this.configFile,
      this.debugRepo,
      this.createConfigFile,
      this.getLicense,
      this.licenseInput,
      this.editorGateway,
      this.enterLicense,
      this.help,
      this.logProviderFactory,
      this.enterToken,
      this.exitAllJobs,
      this.exitJob,
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
