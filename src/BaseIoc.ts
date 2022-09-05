import { Container } from 'inversify';
import ProcessFile from 'process/ProcessFile';
import FinalTerminal from 'terminal/FinalTerminal';
import Spawn from 'common/Spawn';
import Workspace from 'common/Workspace';

/** Main dependency injection class, for classes that are the same in production and unit tests. */
export default class BaseIoc {
  container;

  constructor() {
    this.container = new Container({
      autoBindInjectable: true,
      defaultScope: 'Transient',
    });
  }

  buildBaseTemplate() {
    this.container.bind(FinalTerminal).to(FinalTerminal).inSingletonScope();
    this.container.bind(ProcessFile).to(ProcessFile).inSingletonScope();
    this.container.bind(Spawn).to(Spawn).inSingletonScope();
    this.container.bind(Workspace).to(Workspace).inSingletonScope();

    return this.container;
  }
}
