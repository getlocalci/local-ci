import onlyJobsYml from 'test-tool/fixture/only-jobs.yml';
import getContainer from 'test-tool/TestRoot';

describe('ParsedConfig', () => {
  test('no config', () => {
    const { fsGateway, parsedConfig } = getContainer();
    const existsSyncSpy = jest.fn().mockImplementationOnce(() => false);
    fsGateway.fs.existsSync = existsSyncSpy;

    expect(parsedConfig.get('')).toEqual(undefined);
  });

  test('with config', () => {
    const { fsGateway, parsedConfig } = getContainer();
    const existsSyncSpy = jest.fn().mockImplementationOnce(() => true);
    const readFileSyncSpy = jest.fn().mockImplementationOnce(() => onlyJobsYml);

    fsGateway.fs.existsSync = existsSyncSpy;
    fsGateway.fs.readFileSync = readFileSyncSpy;

    expect(parsedConfig.get('example-path')).toEqual({
      jobs: { test: { docker: { image: 'cimg/node:16.8.0-browsers' } } },
    });
  });
});
