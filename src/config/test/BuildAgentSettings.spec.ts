import AppTestHarness from 'test-tool/helpers/AppTestHarness';
import BuildAgentSettings from 'config/BuildAgentSettings';
import FakeChildProcessGateway from 'gateway/FakeChildProcessGateway';
import FakeOsGateway from 'gateway/FakeOsGateway';

let buildAgentSettings: BuildAgentSettings;
let childProcessGateway: FakeChildProcessGateway;
let osGateway: FakeOsGateway;
let testHarness: AppTestHarness;

describe('BuildAgentSettings', () => {
  beforeEach(() => {
    testHarness = new AppTestHarness();
    testHarness.init();
    buildAgentSettings = testHarness.container.get(BuildAgentSettings);
    osGateway = testHarness.osGateway;
    childProcessGateway = testHarness.childProcessGateway;
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
