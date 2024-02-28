import Cache from '../Cache';

describe('Cache', () => {
  it('can set and get a value', () => {
    const cache = new Cache();
    cache.set('foo', 'baz');
    expect(cache.get('foo')).toBe('baz');
  });

  it('in get(), throws an error if a key does not exist', () => {
    expect(() => new Cache().get('foo')).toThrow('The key foo does not exist');
    expect(() => {
      const cache = new Cache();
      cache.set('foo', 'baz', 0, new Date().getTime() - 1);
      cache.get('foo');
    }).toThrow('The key foo does not exist');
  });

  it('gets whether it has a value', () => {
    const cache = new Cache();
    expect(cache.has('foo')).toBe(false);

    cache.set('foo', 'baz');
    expect(cache.has('foo')).toBe(true);
  });

  describe('cache respects key expiration', () => {
    const hundredSeconds = 100000;
    const cache = new Cache({
      notExpired: {
        val: 'lorem',
        exp: new Date().getTime() + hundredSeconds,
      },
      a: { val: 'lorem', exp: 0 },
      b: { val: 'lorem', exp: 0 },
      c: { val: 'lorem', exp: 0 },
      d: { val: 'lorem', exp: 0 },
      e: { val: 'lorem', exp: 0 },
      f: { val: 'lorem', exp: 0 },
      g: { val: 'lorem', exp: 0 },
      h: { val: 'lorem', exp: 0 },
      i: { val: 'lorem', exp: 0 },
      j: { val: 'lorem', exp: 0 },
    });
    cache.set('foo', 'ipsum');
    cache.set('baz', 'another');

    expect(cache.has('foo')).toBe(true);
    expect(cache.has('baz')).toBe(true);
    expect(cache.has('notExpired')).toBe(true);

    it.each(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'])(
      'is expired',
      (k) => {
        expect(cache.has(k)).toBe(false);
      }
    );
  });
});
