import { Container } from 'inversify';
import AllConfigFiles from 'config/AllConfigFiles';
import AllJobs from 'job/AllJobs';
import BuildAgentSettings from 'config/BuildAgentSettings';
import CommittedImages from 'containerization/CommittedImages';
import CommandFactory from 'job/ComandFactory';
import Config from 'config/Config';
import ConfigFile from 'config/ConfigFile';
import Docker from 'containerization/Docker';
import Email from 'license/Email';
import EnvPath from 'common/EnvPath';
import FinalTerminal from 'terminal/FinalTerminal';
import JobFactory from 'job/JobFactory';
import JobProviderFactory from 'job/JobProviderFactory';
import JobTerminals from 'terminal/JobTerminals';
import License from 'license/License';
import LicenseInput from 'license/LicenseInput';
import LicenseProviderFactory from 'license/LicenseProviderFactory';
import LogFactory from 'log/LogFactory';
import ParsedConfig from 'config/ParsedConfig';
import ProcessFile from 'process/ProcessFile';
import Refresh from 'command/Refresh';
import Registrar from 'common/Registrar';
import Spawn from 'common/Spawn';
import TryProcessAgain from 'command/TryProcessAgain';
import Types from 'common/Types';
import UncommittedFile from 'containerization/UncommittedFile';
import WarningFactory from 'job/WarningFactory';
import Workspace from 'common/Workspace';

/**
 * Main dependency injection class.
 *
 * For classes that are the same in production and unit tests.
 */
export default class BaseIoc {
  container: Container;

  constructor() {
    this.container = new Container({
      autoBindInjectable: true,
      defaultScope: 'Transient',
    });
  }

  buildBaseTemplate(): Container {
    this.container
      .bind(Types.IJobProviderFactory)
      .toFactory(JobProviderFactory);
    this.container.bind(AllConfigFiles).toSelf();
    this.container.bind(AllJobs).toSelf();
    this.container.bind(BuildAgentSettings).toSelf();
    this.container.bind(CommandFactory).toSelf();
    this.container.bind(CommittedImages).toSelf();
    this.container.bind(Config).toSelf();
    this.container.bind(ConfigFile).toSelf();
    this.container.bind(Docker).toSelf();
    this.container.bind(Email).toSelf();
    this.container.bind(EnvPath).toSelf();
    this.container.bind(FinalTerminal).toSelf();
    this.container.bind(JobFactory).toSelf();
    this.container.bind(JobTerminals).toSelf();
    this.container.bind(LogFactory).toSelf();
    this.container.bind(License).toSelf();
    this.container.bind(LicenseInput).toSelf();
    this.container.bind(LicenseProviderFactory).toSelf();
    this.container.bind(ParsedConfig).toSelf();
    this.container.bind(ProcessFile).toSelf();
    this.container.bind(Refresh).toSelf();
    this.container.bind(Registrar).toSelf();
    this.container.bind(Spawn).toSelf();
    this.container.bind(TryProcessAgain).toSelf();
    this.container.bind(UncommittedFile).toSelf();
    this.container.bind(WarningFactory).toSelf();
    this.container.bind(Workspace).toSelf();

    return this.container;
  }
}
