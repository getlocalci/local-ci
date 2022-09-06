import { decorate, inject, injectable } from 'inversify';
import OsGateway from './OsGateway';
import types from './Types';

class EnvPath {
  osGateway!: OsGateway;

  /**
   * Gets the environment path.
   *
   * Mainly copied from https://github.com/microsoft/vscode-docker/blob/1aa4d6050020ba5c13f249af3ed4022e9b671534/src/spawnAsync.ts#L254
   * Looks for `/usr/local/bin` in the PATH.
   * Must be whole, i.e. the left side must be the beginning of the string or :, and the right side must be the end of the string or :
   * Case-insensitive, because Mac is.
   */
  get(): string {
    const path = process.env.PATH || '';

    return this.isMac() && !/(?<=^|:)\/usr\/local\/bin(?=$|:)/i.test(path)
      ? `${path}:/usr/local/bin`
      : path;
  }

  isMac(): boolean {
    return this.osGateway.os.type() === 'Darwin';
  }
}

decorate(injectable(), EnvPath);
decorate(inject(types.IOsGateway), EnvPath.prototype, 'osGateway');
export default EnvPath;
