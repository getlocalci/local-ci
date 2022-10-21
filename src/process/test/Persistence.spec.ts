import AppTestHarness from 'test-tool/helper/AppTestHarness';
import Persistence from 'process/Persistence';

let persistence: Persistence;

describe('Persistence', () => {
  beforeEach(() => {
    const testHarness = new AppTestHarness();
    testHarness.init();
    persistence = testHarness.container.get(Persistence);
  });

  describe('getDependencies', () => {
    test('no dependency', () => {
      const allJobs = new Map();
      allJobs.set('foo', []);

      expect(persistence.getDependencies('another', allJobs)).toEqual([]);
    });

    test('single dependency', () => {
      const allJobs = new Map();
      allJobs.set('foo', []);
      allJobs.set('baz', ['foo']);

      expect(persistence.getDependencies('baz', allJobs)).toEqual(['foo']);
    });

    test('complex tree', () => {
      const allJobs = new Map();
      allJobs.set('foo', []);
      allJobs.set('cd', []);
      allJobs.set('baz', ['foo']);
      allJobs.set('example', ['baz', 'cd']);
      allJobs.set('another', ['example']);

      expect(persistence.getDependencies('another', allJobs)).toEqual([
        'foo',
        'baz',
        'cd',
        'example',
      ]);
    });
  });
});
