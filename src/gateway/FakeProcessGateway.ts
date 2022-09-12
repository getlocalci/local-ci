import { injectable } from 'inversify';

/** Stub class for process. */
@injectable()
export default class FakeProcessGateway {
  process = {
    env: { PATH: 'example/here/' },
  };
}
