import { Container } from 'inversify'

/** Main dependency injection class, for classes that are the same in production and unit tests. */
export default class BaseIOC {
  container

  constructor() {
    this.container = new Container({
      autoBindInjectable: true,
      defaultScope: 'Transient'
    })
  }

  buildBaseTemplate() {
    return this.container
  }
}
