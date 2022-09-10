import { Container } from 'inversify';
import ProcessFile from 'process/ProcessFile';
import Config from 'config/Config';
import EnvPath from 'common/EnvPath';
import FinalTerminal from 'terminal/FinalTerminal';
import JobTerminals from 'terminal/JobTerminals';
import License from 'license/License';
import Spawn from 'common/Spawn';
import Workspace from 'common/Workspace';
import CommittedImages from 'containerization/CommittedImages';
import CommandFactory from 'job/ComandFactory';
import JobFactory from 'job/JobFactory';
import LogFactory from 'log/LogFactory';
import JobProviderFactory from 'job/JobProviderFactory';
import WarningFactory from 'job/WarningFactory';
import AllConfigFiles from 'config/AllConfigFiles';
import ConfigFile from 'config/ConfigFile';
import Docker from 'containerization/Docker';
import ParsedConfig from 'config/ParsedConfig';
import AllJobs from 'job/AllJobs';
import Types from 'common/Types';
import Email from 'license/Email';

/**
 * Main dependency injection class.
 *
 * For classes that are the same in production and unit tests.
 */
export default class BaseIoc {
  container: IocContainer;

  constructor() {
    this.container = new Container({
      autoBindInjectable: true,
      defaultScope: 'Transient',
    });
  }

  buildBaseTemplate(): IocContainer {
    this.container
      .bind(Types.IJobProviderFactory)
      .toFactory(JobProviderFactory);
    this.container.bind(AllConfigFiles).toSelf();
    this.container.bind(ConfigFile).toSelf();
    this.container.bind(CommandFactory).toSelf();
    this.container.bind(Docker).toSelf();
    this.container.bind(FinalTerminal).toSelf();
    this.container.bind(JobTerminals).toSelf();
    this.container.bind(EnvPath).toSelf();
    this.container.bind(JobFactory).toSelf();
    this.container.bind(LogFactory).toSelf();
    this.container.bind(WarningFactory).toSelf();
    this.container.bind(License).toSelf();
    this.container.bind(ProcessFile).toSelf();
    this.container.bind(Config).toSelf();
    this.container.bind(Spawn).toSelf();
    this.container.bind(Workspace).toSelf();
    this.container.bind(CommittedImages).toSelf();
    this.container.bind(ParsedConfig).toSelf();
    this.container.bind(AllJobs).toSelf();
    this.container.bind(Email).toSelf();
    return this.container;
  }
}
