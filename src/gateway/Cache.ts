type Store = { [k: string]: { val: unknown; exp: number } };

export default class Cache {
  store: Store;

  constructor(store: Store = {}) {
    this.store = Object.freeze(store);
  }

  get(key: string) {
    if (!this.has(key)) {
      throw new Error(`The key ${key} does not exist`);
    }
    return this.store[key]?.val;
  }

  has(key: string) {
    return !!this.store[key] && !this.expired(this.store, key);
  }

  set(key: string, val: unknown, exp = 86400000, now = new Date().getTime()) {
    return new Cache({
      ...this.store,
      [key]: {
        val,
        exp: exp + now,
      },
    }).expire();
  }

  private expire() {
    return new Cache(this.expireMany(this.store, 20));
  }

  private expired(store: Store, key: string, now = new Date().getTime()) {
    if (!store[key]) {
      throw new Error(`The key ${key} does not exist`);
    }

    return now > store[key].exp;
  }

  private expireMany(store: Store, n: number, expired?: Store): Store {
    if (
      expired &&
      (toArray(expired).length <= 0.25 * n || toArray(store).length === 0)
    ) {
      return store;
    }

    const newExpired = this.expireN(store, n);
    return this.expireMany(dissoc(store, newExpired), n, newExpired);
  }

  private expireN(store: Store, n: number, now = new Date().getTime()) {
    return toObject(
      toArray(store)
        .slice(0, n)
        .filter(([, item]) => now > item.exp)
    ) as Store;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toObject(arr: Array<any>) {
  return arr.reduce(
    (acc, [k, v]) => ({
      ...acc,
      [k]: v,
    }),
    {}
  );
}

function toArray(obj: Store) {
  return Object.entries(obj);
}

/** Gets a copy of a that has no key from b. */
function dissoc(a: Record<string, unknown>, b: Record<string, unknown>) {
  return Object.entries(a).reduce(
    (acc, [k, v]) =>
      k in b
        ? acc
        : {
            ...acc,
            [k]: v,
          },
    {}
  );
}
