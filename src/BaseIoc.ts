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
    this.container.bind(AllConfigFiles).toSelf().inSingletonScope();
    this.container.bind(ConfigFile).toSelf().inSingletonScope();
    this.container.bind(CommandFactory).toSelf().inSingletonScope();
    this.container.bind(Docker).toSelf().inSingletonScope();
    this.container.bind(FinalTerminal).toSelf().inSingletonScope();
    this.container.bind(JobTerminals).toSelf().inSingletonScope();
    this.container.bind(EnvPath).toSelf().inSingletonScope();
    this.container.bind(JobFactory).toSelf().inSingletonScope();
    this.container.bind(LogFactory).toSelf().inSingletonScope();
    this.container.bind(WarningFactory).toSelf().inSingletonScope();
    this.container.bind(License).toSelf().inSingletonScope();
    this.container.bind(ProcessFile).toSelf().inSingletonScope();
    this.container.bind(Config).toSelf().inSingletonScope();
    this.container.bind(Spawn).toSelf().inSingletonScope();
    this.container.bind(Workspace).toSelf().inSingletonScope();
    this.container.bind(CommittedImages).toSelf().inSingletonScope();
    this.container.bind(ParsedConfig).toSelf().inSingletonScope();
    this.container.bind(AllJobs).toSelf().inSingletonScope();
    return this.container;
  }
}
