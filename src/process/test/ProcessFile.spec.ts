import { normalize } from 'test-tools/helpers';
import AppTestHarness from 'test-tools/helpers/AppTestHarness';
import ProcessFile from 'process/ProcessFile';
import FakeFsGateway from 'common/FakeFsGateway';
import withCacheFixture from 'test-tools/fixture/with-cache.yml';
import withCacheExpected from 'test-tools/expected/with-cache.yml';
import dyanamicConfigFixture from 'test-tools/fixture/dynamic-config.yml';
import dynamicConfigExpected from 'test-tools/expected/dynamic-config.yml';

let testHarness: AppTestHarness;
let fsGateway: FakeFsGateway;

describe('ProcessFile', () => {
  beforeEach(() => {
    testHarness = new AppTestHarness();
    testHarness.init();
    fsGateway = testHarness.fsGateway;
  });

  test('full config file with cache', () => {
    const processFile = testHarness.container.get(ProcessFile);
    const writeFileSpy = jest.fn();
    fsGateway.fs.writeFileSync = writeFileSpy;
    processFile.write(withCacheFixture, '/foo/baz/');

    expect(writeFileSpy).toHaveBeenCalledTimes(1);
    expect(normalize(writeFileSpy.mock.lastCall[1])).toEqual(
      normalize(withCacheExpected)
    );
  });

  test('dynamic config', () => {
    const processFile = testHarness.container.get(ProcessFile);
    const writeFileSpy = jest.fn();
    fsGateway.fs.writeFileSync = writeFileSpy;
    processFile.write(dyanamicConfigFixture, '/foo/baz/');

    expect(writeFileSpy).toHaveBeenCalledTimes(1);
    expect(normalize(writeFileSpy.mock.lastCall[1])).toEqual(
      normalize(dynamicConfigExpected)
    );
  });
});
