import { Container } from 'inversify';
import ProcessFile from 'process/ProcessFile';
import EnvPath from 'common/EnvPath';
import FinalTerminal from 'terminal/FinalTerminal';
import Spawn from 'common/Spawn';
import Workspace from 'common/Workspace';

/**
 * Main dependency injection class.
 *
 * For classes that are the same in production and unit tests.
 */
export default class BaseIoc {
  container;

  constructor() {
    this.container = new Container({
      autoBindInjectable: true,
      defaultScope: 'Transient',
    });
  }

  buildBaseTemplate() {
    this.container.bind(FinalTerminal).toSelf().inSingletonScope();
    this.container.bind(EnvPath).toSelf().inSingletonScope();
    this.container.bind(ProcessFile).toSelf().inSingletonScope();
    this.container.bind(Spawn).toSelf().inSingletonScope();
    this.container.bind(Workspace).toSelf().inSingletonScope();

    return this.container;
  }
}
