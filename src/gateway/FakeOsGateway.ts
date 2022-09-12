import { injectable } from 'inversify';

/** Stub class for operating system. */
@injectable()
export default class FakeOsGateway {
  os = {
    arch: () => '',
    platform: () => '',
    type: () => '',
  };
}
