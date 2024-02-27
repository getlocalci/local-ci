/* eslint @typescript-eslint/no-empty-function: 0 */
import { injectable } from 'inversify';

@injectable()
export default class FakeCache {
  get() {}
  has() {
    return false;
  }
  set() {}
}
