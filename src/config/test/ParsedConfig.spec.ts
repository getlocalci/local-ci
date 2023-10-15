import FsGateway from 'gateway/FsGateway';
import onlyJobsYml from 'test-tool/fixture/only-jobs.yml';
import ParsedConfig from 'config/ParsedConfig';
import container from 'common/TestAppRoot';

let fsGateway: FsGateway;
let parsedConfig: ParsedConfig;

describe('ParsedConfig', () => {
  beforeEach(() => {
    parsedConfig = container.parsedConfig;
    fsGateway = container.fsGateway;
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
