import { decorate, injectable } from 'inversify';

/** Stub class for filesystem. */
class FakeOsGateway {
  os = {
    type: () => null,
  };
}

decorate(injectable(), FakeOsGateway);
export default FakeOsGateway;
