import { decorate, injectable } from 'inversify';

/** Stub class for filesystem. */
class FakeFsGateway {
  fs = {
    existsSync: () => null,
    mkdirSync: () => null,
    writeFileSync: () => null,
  };
}

decorate(injectable(), FakeFsGateway);
export default FakeFsGateway;
