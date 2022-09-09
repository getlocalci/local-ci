import { inject, injectable } from 'inversify';
import OsGateway from './OsGateway';
import ProcessGateway from './ProcessGateway';
import Types from './Types';

@injectable()
export default class EnvPath {
  @inject(Types.IOsGateway)
  osGateway!: OsGateway;

  @inject(Types.IProcessGateway)
  processGateway!: ProcessGateway;

  /**
   * Gets the environment path.
   *
   * Mainly copied from https://github.com/microsoft/vscode-docker/blob/1aa4d6050020ba5c13f249af3ed4022e9b671534/src/spawnAsync.ts#L254
   * Looks for `/usr/local/bin` in the PATH.
   * Must be whole, i.e. the left side must be the beginning of the string or :, and the right side must be the end of the string or :
   * Case-insensitive, because Mac is.
   */
  get(): string {
    const path = this.processGateway.process.env.PATH || '';

    return this.isMac() && !/(?<=^|:)\/usr\/local\/bin(?=$|:)/i.test(path)
      ? `${path}:/usr/local/bin`
      : path;
  }

  isMac(): boolean {
    return this.osGateway.os.type() === 'Darwin';
  }
}
