/* eslint @typescript-eslint/no-empty-function: 0 */
export default class FakeCache {
  constructor() {}
  get() {}
  has() {
    return false;
  }
  set() {}
}
