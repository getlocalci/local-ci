import AppTestHarness from 'test-tools/helpers/AppTestHarness';
import FakeChildProcessGateway from 'gateway/FakeChildProcessGateway';
import FakeOsGateway from 'gateway/FakeOsGateway';
import BuildAgentSettings from 'config/BuildAgentSettings';

let testHarness: AppTestHarness;
let buildAgentSettings: BuildAgentSettings;
let childProcessGateway: FakeChildProcessGateway;
let osGateway: FakeOsGateway;

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
    expect(spawnSpy.mock.calls.length).toEqual(0);
  });

  test('should not set the settings on an M1 Mac machine', () => {
    const spawnSpy = jest.fn();
    osGateway.os.type = jest.fn().mockImplementationOnce(() => 'Darwin');
    osGateway.os.arch = jest.fn().mockImplementationOnce(() => 'arm64');
    childProcessGateway.cp.spawn = spawnSpy;

    buildAgentSettings.set();
    expect(spawnSpy.mock.calls.length).toEqual(0);
  });

  test('should set the settings on an Intel Mac machine', () => {
    const spawnSpy = jest.fn();
    osGateway.os.type = jest.fn().mockImplementationOnce(() => 'Darwin');
    osGateway.os.arch = jest.fn().mockImplementationOnce(() => 'x64');
    childProcessGateway.cp.spawn = spawnSpy;

    buildAgentSettings.set();
    expect(spawnSpy.mock.calls.length).toEqual(1);
  });
});
