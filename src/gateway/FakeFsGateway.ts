import { injectable } from 'inversify';

/** Stub class for filesystem. */
@injectable()
export default class FakeFsGateway {
  fs = {
    existsSync: () => null,
    mkdirSync: () => null,
    readFileSync: () => null,
    rmSync: () => null,
    writeFileSync: () => null,
  };
}
