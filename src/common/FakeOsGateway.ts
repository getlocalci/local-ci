import { injectable } from 'inversify';

/** Stub class for operating system. */
@injectable()
export default class FakeOsGateway {
  os = {
    platform: () => '',
    type: () => '',
  };
}
