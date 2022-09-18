import AppTestHarness from 'test-tools/helper/AppTestHarness';
import EnvPath from 'common/EnvPath';
import FakeOsGateway from 'gateway/FakeOsGateway';
import FakeProcessGateway from 'gateway/FakeProcessGateway';

let testHarness: AppTestHarness;
let envPath: EnvPath;
let osGateway: FakeOsGateway;
let processGateway: FakeProcessGateway;

describe('EnvPath', () => {
  beforeEach(() => {
    testHarness = new AppTestHarness();
    testHarness.init();
    envPath = testHarness.container.get(EnvPath);
    osGateway = testHarness.osGateway;
    processGateway = testHarness.processGateway;
  });

  describe('get', () => {
    test('on Linux', () => {
      osGateway.os.type = jest.fn().mockImplementationOnce(() => 'Linux');
      processGateway.process.env = { PATH: '' };

      expect(envPath.get()).toEqual('');
    });

    test('on Mac without the bin path', () => {
      osGateway.os.type = jest.fn().mockImplementationOnce(() => 'Darwin');
      processGateway.process.env = { PATH: 'Users/Foo/' };

      expect(envPath.get()).toEqual('Users/Foo/:/usr/local/bin');
    });

    test('on Mac with the bin path', () => {
      osGateway.os.type = jest.fn().mockImplementationOnce(() => 'Darwin');
      processGateway.process.env = { PATH: 'Users/Foo/:/usr/local/bin' };

      expect(envPath.get()).toEqual('Users/Foo/:/usr/local/bin');
    });
  });

  describe('isMac', () => {
    test('mac', () => {
      osGateway.os.type = () => 'Darwin';
      expect(envPath.isMac());
    });

    test('linux', () => {
      osGateway.os.type = () => 'Linux';
      expect(envPath.isMac()).toEqual(false);
    });

    test('windows', () => {
      osGateway.os.type = () => 'Windows_NT';
      expect(envPath.isMac()).toEqual(false);
    });
  });
});
