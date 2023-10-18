import getContainer from 'test-tool/TestRoot';

describe('Docker', () => {
  describe('getError', () => {
    test('no error', () => {
      const { childProcessGateway, docker } = getContainer();
      const execSyncSpy = jest.fn();
      childProcessGateway.cp.execSync = execSyncSpy;
      expect(docker.getError()).toEqual('');
      expect(execSyncSpy.mock.calls.length).toEqual(1);
    });

    test('with error', () => {
      const { childProcessGateway, docker } = getContainer();
      const message = 'Cannot connect to the Docker daemon';

      const execSyncSpy = jest.fn().mockImplementationOnce(() => {
        throw new Error(message);
      });
      childProcessGateway.cp.execSync = execSyncSpy;

      expect(docker.getError()).toEqual(message);
    });
  });

  describe('isRunning', () => {
    test('is not running', () => {
      const { childProcessGateway, docker } = getContainer();
      const execSyncSpy = jest.fn().mockImplementationOnce(() => {
        throw new Error('Cannot connect to the Docker daemon');
      });
      childProcessGateway.cp.execSync = execSyncSpy;
      expect(docker.isRunning()).toEqual(false);
    });

    test('is running', () => {
      const { childProcessGateway, docker } = getContainer();
      childProcessGateway.cp.execSync = jest.fn();
      expect(docker.isRunning()).toEqual(true);
    });
  });
});
