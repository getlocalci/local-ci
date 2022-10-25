import { Container as IocContainer } from 'inversify';
import AllConfigFiles from 'config/AllConfigFiles';
import AllJobs from 'job/AllJobs';
import BuildAgentSettings from 'config/BuildAgentSettings';
import Children from 'job/Children';
import CommittedImages from 'containerization/CommittedImages';
import CommandFactory from 'job/ComandFactory';
import Config from 'config/Config';
import ConfigFile from 'config/ConfigFile';
import CreateConfigFile from 'command/CreateConfigFile';
import DebugRepo from 'command/DebugRepo';
import Docker from 'containerization/Docker';
import Email from 'license/Email';
import EnterToken from 'command/EnterToken';
import EnvPath from 'common/EnvPath';
import ExitAllJobs from 'command/ExitAllJobs';
import ExitJob from 'command/ExitJob';
import FinalTerminal from 'terminal/FinalTerminal';
import GetLicense from 'command/GetLicense';
import JobFactory from 'job/JobFactory';
import JobProviderFactory from 'job/JobProviderFactory';
import JobRunner from 'job/JobRunner';
import JobListener from 'job/JobListener';
import JobTerminals from 'terminal/JobTerminals';
import LatestCommittedImage from 'containerization/LatestCommittedImage';
import License from 'license/License';
import LicenseInput from 'license/LicenseInput';
import LicenseProviderFactory from 'license/LicenseProviderFactory';
import LogFactory from 'log/LogFactory';
import LogFile from 'log/LogFile';
import LogProviderFactory from 'log/LogProviderFactory';
import ParsedConfig from 'config/ParsedConfig';
import Persistence from 'process/Persistence';
import PipelineParameter from 'config/PipelineParameter';
import ProcessFile from 'process/ProcessFile';
import Refresh from 'command/Refresh';
import RegistrarFactory from 'common/RegistrarFactory';
import ReRunJob from 'command/ReRunJob';
import Retryer from 'job/Retryer';
import RunJob from 'command/RunJob';
import RunningContainer from 'containerization/RunningContainer';
import RunWalkthroughJob from 'command/RunWalkthroughJob';
import SelectRepo from 'command/SelectRepo';
import Spawn from 'common/Spawn';
import TryProcessAgain from 'command/TryProcessAgain';
import UncommittedFile from 'containerization/UncommittedFile';
import WarningCommandFactory from 'job/WarningCommandFactory';
import WarningFactory from 'job/WarningFactory';
import Workspace from 'common/Workspace';

/**
 * Main dependency injection class.
 *
 * For classes that are the same in production and unit tests.
 */
export default class BaseIoc {
  container: IocContainer;

  constructor() {
    this.container = new IocContainer({
      autoBindInjectable: true,
      defaultScope: 'Transient',
    });
  }

  buildBaseTemplate(): IocContainer {
    this.container.bind(AllConfigFiles).toSelf();
    this.container.bind(AllJobs).toSelf();
    this.container.bind(BuildAgentSettings).toSelf();
    this.container.bind(Children).toSelf();
    this.container.bind(CommandFactory).toSelf();
    this.container.bind(CommittedImages).toSelf();
    this.container.bind(Config).toSelf();
    this.container.bind(ConfigFile).toSelf();
    this.container.bind(CreateConfigFile).toSelf();
    this.container.bind(DebugRepo).toSelf();
    this.container.bind(Docker).toSelf();
    this.container.bind(Email).toSelf();
    this.container.bind(EnterToken).toSelf();
    this.container.bind(EnvPath).toSelf();
    this.container.bind(ExitAllJobs).toSelf();
    this.container.bind(ExitJob).toSelf();
    this.container.bind(FinalTerminal).toSelf();
    this.container.bind(GetLicense).toSelf();
    this.container.bind(JobFactory).toSelf();
    this.container.bind(JobListener).toSelf();
    this.container.bind(JobProviderFactory).toSelf();
    this.container.bind(JobRunner).toSelf();
    this.container.bind(JobTerminals).toSelf();
    this.container.bind(LogFactory).toSelf();
    this.container.bind(LogFile).toSelf();
    this.container.bind(LatestCommittedImage).toSelf();
    this.container.bind(License).toSelf();
    this.container.bind(LicenseInput).toSelf();
    this.container.bind(LicenseProviderFactory).toSelf();
    this.container.bind(LogProviderFactory).toSelf();
    this.container.bind(ParsedConfig).toSelf();
    this.container.bind(Persistence).toSelf();
    this.container.bind(PipelineParameter).toSelf();
    this.container.bind(ProcessFile).toSelf();
    this.container.bind(Refresh).toSelf();
    this.container.bind(RegistrarFactory).toSelf();
    this.container.bind(ReRunJob).toSelf();
    this.container.bind(Retryer).toSelf();
    this.container.bind(RunWalkthroughJob).toSelf();
    this.container.bind(RunJob).toSelf();
    this.container.bind(RunningContainer).toSelf();
    this.container.bind(SelectRepo).toSelf();
    this.container.bind(Spawn).toSelf();
    this.container.bind(TryProcessAgain).toSelf();
    this.container.bind(UncommittedFile).toSelf();
    this.container.bind(WarningCommandFactory).toSelf();
    this.container.bind(WarningFactory).toSelf();
    this.container.bind(Workspace).toSelf();

    return this.container;
  }
}
