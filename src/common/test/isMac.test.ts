import EnvPath from 'common/EnvPath';
import AppTestHarness from 'test-tools/helpers/AppTestHarness';
import FakeOsGateway from 'common/FakeOsGateway';

let testHarness: AppTestHarness;
let envPath: EnvPath;
let osGateway: FakeOsGateway;

describe('isMac', () => {
  beforeEach(() => {
    testHarness = new AppTestHarness();
    testHarness.init();
    envPath = testHarness.container.get(EnvPath);
    osGateway = testHarness.osGateway;
  });

  test('mac', async () => {
    osGateway.os.type = () => 'Darwin';
    expect(envPath.isMac());
  });

  test('linux', async () => {
    osGateway.os.type = () => 'Linux';
    expect(envPath.isMac()).toEqual(false);
  });

  test('windows', async () => {
    osGateway.os.type = () => 'Windows_NT';
    expect(envPath.isMac()).toEqual(false);
  });
});
