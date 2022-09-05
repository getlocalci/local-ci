import 'reflect-metadata';
import { Container } from 'inversify';
import ProcessFile from 'process/ProcessFile';
import FinalTerminal from 'terminal/FinalTerminal';

/** Main dependency injection class, for classes that are the same in production and unit tests. */
export default class BaseIOC {
  container;

  constructor() {
    this.container = new Container({
      autoBindInjectable: true,
      defaultScope: 'Transient',
    });
  }

  buildBaseTemplate() {
    this.container.bind(ProcessFile).to(ProcessFile).inSingletonScope();
    this.container.bind(FinalTerminal).to(FinalTerminal).inSingletonScope();
    return this.container;
  }
}
