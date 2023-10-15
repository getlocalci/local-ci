import BuildAgentSettings from 'config/BuildAgentSettings';
import ChildProcessGateway from 'gateway/ChildProcessGateway';
import OsGateway from 'gateway/OsGateway';
import container from 'common/TestAppRoot';

let buildAgentSettings: BuildAgentSettings;
let childProcessGateway: ChildProcessGateway;
let osGateway: OsGateway;

describe('BuildAgentSettings', () => {
  beforeEach(() => {
    buildAgentSettings = container.buildAgentSettings;
    osGateway = container.osGateway;
    childProcessGateway = container.childProcessGateway;
  });

  test('should not set the settings on a Linux machine', () => {
    const spawnSpy = jest.fn();
    osGateway.os.type = jest.fn().mockImplementationOnce(() => 'Intel');
    osGateway.os.arch = jest.fn().mockImplementationOnce(() => 'x64');
    childProcessGateway.cp.spawn = spawnSpy;

    buildAgentSettings.set();
    expect(spawnSpy).not.toHaveBeenCalled();
  });

  test('should not set the settings on an M1 Mac machine', () => {
    const spawnSpy = jest.fn();
    osGateway.os.type = jest.fn().mockImplementationOnce(() => 'Darwin');
    osGateway.os.arch = jest.fn().mockImplementationOnce(() => 'arm64');
    childProcessGateway.cp.spawn = spawnSpy;

    buildAgentSettings.set();
    expect(spawnSpy).not.toHaveBeenCalled();
  });

  test('should set the settings on an Intel Mac machine', () => {
    const spawnSpy = jest.fn();
    osGateway.os.type = jest.fn().mockImplementationOnce(() => 'Darwin');
    osGateway.os.arch = jest.fn().mockImplementationOnce(() => 'x64');
    childProcessGateway.cp.spawn = spawnSpy;

    buildAgentSettings.set();
    expect(spawnSpy).toHaveBeenCalledTimes(1);
  });
});
