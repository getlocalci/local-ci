import { decorate, injectable } from 'inversify';

/** Stub class for filesystem. */
class FakeFsGateway {
  fs = {
    existsSync: () => {},
    mkdirSync: () => {},
    writeFileSync: () => {}
  };
}

decorate(injectable(), FakeFsGateway);
export default FakeFsGateway;
