import getContainer from 'test-tool/TestRoot';

describe('EnvPath', () => {
  describe('get', () => {
    test('on Linux', () => {
      const { envPath, osGateway, processGateway } = getContainer();
      osGateway.os.type = jest.fn().mockImplementationOnce(() => 'Linux');
      processGateway.process.env = { PATH: '' };

      expect(envPath.get()).toEqual('');
    });

    test('on Mac without the bin path', () => {
      const { envPath, osGateway, processGateway } = getContainer();
      osGateway.os.type = jest.fn().mockImplementationOnce(() => 'Darwin');
      processGateway.process.env = { PATH: 'Users/Foo/' };

      expect(envPath.get()).toEqual('Users/Foo/:/usr/local/bin');
    });

    test('on Mac with the bin path', () => {
      const { envPath, osGateway, processGateway } = getContainer();
      osGateway.os.type = jest.fn().mockImplementationOnce(() => 'Darwin');
      processGateway.process.env = { PATH: 'Users/Foo/:/usr/local/bin' };

      expect(envPath.get()).toEqual('Users/Foo/:/usr/local/bin');
    });
  });

  describe('isMac', () => {
    test('mac', () => {
      const { envPath, osGateway } = getContainer();
      osGateway.os.type = () => 'Darwin';
      expect(envPath.isMac());
    });

    test('linux', () => {
      const { envPath, osGateway } = getContainer();
      osGateway.os.type = () => 'Linux';
      expect(envPath.isMac()).toEqual(false);
    });

    test('windows', () => {
      const { envPath, osGateway } = getContainer();
      osGateway.os.type = () => 'Windows_NT';
      expect(envPath.isMac()).toEqual(false);
    });
  });
});
