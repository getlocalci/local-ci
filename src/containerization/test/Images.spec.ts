import AppTestHarness from 'test-tool/helper/AppTestHarness';
import Images from 'containerization/Images';
import FakeChildProcessGateway from 'gateway/FakeChildProcessGateway';

let childProcessGateway: FakeChildProcessGateway;
let images: Images;
let testHarness: AppTestHarness;

describe('Images', () => {
  beforeEach(() => {
    testHarness = new AppTestHarness();
    testHarness.init();
    images = testHarness.container.get(Images);
    childProcessGateway = testHarness.childProcessGateway;
  });

  test('no error', () => {
    const spawnSpy = jest.fn();
    childProcessGateway.cp.spawn = spawnSpy;

    images.cleanUp('local-ci/lint');
    expect(spawnSpy).toHaveBeenCalledTimes(1);
  });
});
