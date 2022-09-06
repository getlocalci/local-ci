import { decorate, injectable } from 'inversify';

/** Stub class for operating system. */
class FakeOsGateway {
  os = {
    platform: () => '',
    type: () => '',
  };
}

decorate(injectable(), FakeOsGateway);
export default FakeOsGateway;
