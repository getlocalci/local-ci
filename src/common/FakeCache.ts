/* eslint @typescript-eslint/no-empty-function: 0 */
type Store = { [k: string]: { val: unknown; exp: number } };

export default class FakeCache {
  constructor(private store: Store = {}) {}
  get() {}
  has() {
    return false;
  }
  set() {}
}
