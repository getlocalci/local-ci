import AppTestHarness from 'test-tool/helpers/AppTestHarness';
import dynamicConfigExpected from 'test-tool/expected/dynamic-config.yml';
import dyanamicConfigFixture from 'test-tool/fixture/dynamic-config.yml';
import ProcessFile from 'process/ProcessFile';
import FakeFsGateway from 'gateway/FakeFsGateway';
import normalize from 'test-tool/helpers/normalize';
import withCacheExpected from 'test-tool/expected/with-cache.yml';
import withCacheFixture from 'test-tool/fixture/with-cache.yml';

let fsGateway: FakeFsGateway;
let testHarness: AppTestHarness;

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
