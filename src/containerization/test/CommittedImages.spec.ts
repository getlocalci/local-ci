import AppTestHarness from 'test-tools/helpers/AppTestHarness';
import CommittedImages from 'containerization/CommittedImages';
import FakeChildProcessGateway from 'gateway/FakeChildProcessGateway';

let childProcessGateway: FakeChildProcessGateway;
let committedImages: CommittedImages;
let testHarness: AppTestHarness;

describe('CommittedImages', () => {
  beforeEach(() => {
    testHarness = new AppTestHarness();
    testHarness.init();
    committedImages = testHarness.container.get(CommittedImages);
    childProcessGateway = testHarness.childProcessGateway;
  });

  test('no error', () => {
    const spawnSpy = jest.fn();
    childProcessGateway.cp.spawn = spawnSpy;

    committedImages.cleanUp('local-ci-lint');
    expect(spawnSpy).toHaveBeenCalledTimes(1);
  });
});
