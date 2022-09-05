import { decorate, injectable } from 'inversify';

/** Stub class for cp. */
class FakeChildProcessGateway {
  cp = {
    spawn: () => null,
    spawnSync: () => null,
  };
}

decorate(injectable(), FakeChildProcessGateway);
export default FakeChildProcessGateway;
