import getConfig from 'config/getConfig';
import onlyJobsYml from 'test-tools/fixture/only-jobs.yml';
import AppTestHarness from 'test-tools/helpers/AppTestHarness';
import ParsedConfig from 'config/ParsedConfig';
import FakeFsGateway from 'common/FakeFsGateway';

let testHarness: AppTestHarness;
let parsedConfig: ParsedConfig;
let fsGateway: FakeFsGateway;

describe('ParsedConfig', () => {
  beforeEach(() => {
    testHarness = new AppTestHarness();
    testHarness.init();
    parsedConfig = testHarness.container.get(ParsedConfig);
    fsGateway = testHarness.fsGateway;
  });

  test('no config', () => {
    const existsSyncSpy = jest.fn().mockImplementationOnce(() => false);
    fsGateway.fs.existsSync = existsSyncSpy;

    expect(parsedConfig.get('')).toEqual(undefined);
  });

  test('with config', () => {
    const existsSyncSpy = jest.fn().mockImplementationOnce(() => true);
    const readFileSyncSpy = jest.fn().mockImplementationOnce(() => onlyJobsYml);

    fsGateway.fs.existsSync = existsSyncSpy;
    fsGateway.fs.readFileSync = readFileSyncSpy;

    expect(parsedConfig.get('example-path')).toEqual({
      jobs: { test: { docker: { image: 'cimg/node:16.8.0-browsers' } } },
    });
  });
});
