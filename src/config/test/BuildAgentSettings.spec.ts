import getContainer from 'test-tool/TestRoot';

describe('BuildAgentSettings', () => {
  test('should not set the settings on a Linux machine', () => {
    const { buildAgentSettings, childProcessGateway, osGateway } =
      getContainer();
    const spawnSpy = jest.fn();
    osGateway.os.type = jest.fn().mockImplementationOnce(() => 'Intel');
    osGateway.os.arch = jest.fn().mockImplementationOnce(() => 'x64');
    childProcessGateway.cp.spawn = spawnSpy;

    buildAgentSettings.set();
    expect(spawnSpy).not.toHaveBeenCalled();
  });

  test('should not set the settings on an M1 Mac machine', () => {
    const { buildAgentSettings, childProcessGateway, osGateway } =
      getContainer();
    const spawnSpy = jest.fn();
    osGateway.os.type = jest.fn().mockImplementationOnce(() => 'Darwin');
    osGateway.os.arch = jest.fn().mockImplementationOnce(() => 'arm64');
    childProcessGateway.cp.spawn = spawnSpy;

    buildAgentSettings.set();
    expect(spawnSpy).not.toHaveBeenCalled();
  });

  test('should set the settings on an Intel Mac machine', () => {
    const { buildAgentSettings, childProcessGateway, osGateway } =
      getContainer();
    const spawnSpy = jest.fn();
    osGateway.os.type = jest.fn().mockImplementationOnce(() => 'Darwin');
    osGateway.os.arch = jest.fn().mockImplementationOnce(() => 'x64');
    childProcessGateway.cp.spawn = spawnSpy;

    buildAgentSettings.set();
    expect(spawnSpy).toHaveBeenCalledTimes(1);
  });
});
