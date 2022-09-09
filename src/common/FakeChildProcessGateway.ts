import { injectable } from 'inversify';

/** Stub class for cp. */
@injectable()
export default class FakeChildProcessGateway {
  cp = {
    spawn: () => null,
    spawnSync: () => null,
  };
}
