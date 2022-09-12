import AppTestHarness from 'test-tools/helpers/AppTestHarness';
import Docker from 'containerization/Docker';
import ChildProcessGateway from 'gateway/ChildProcessGateway';
import Types from 'common/Types';

let testHarness: AppTestHarness;
let docker: Docker;
let childProcessGateway: ChildProcessGateway;

describe('Docker', () => {
  beforeEach(() => {
    testHarness = new AppTestHarness();
    testHarness.init();
    docker = testHarness.container.get(Docker);
    childProcessGateway = testHarness.container.get(Types.IChildProcessGateway);
  });

  describe('getError', () => {
    test('no error', () => {
      const execSyncSpy = jest.fn();
      childProcessGateway.cp.execSync = execSyncSpy;
      expect(docker.getError()).toEqual('');
      expect(execSyncSpy.mock.calls.length).toEqual(1);
    });

    test('with error', () => {
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
      const execSyncSpy = jest.fn().mockImplementationOnce(() => {
        throw new Error('Cannot connect to the Docker daemon');
      });
      childProcessGateway.cp.execSync = execSyncSpy;
      expect(docker.isRunning()).toEqual(false);
    });

    test('is running', () => {
      childProcessGateway.cp.execSync = jest.fn();
      expect(docker.isRunning()).toEqual(true);
    });
  });
});
