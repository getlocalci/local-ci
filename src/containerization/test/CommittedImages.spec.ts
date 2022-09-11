import CommittedImages from 'containerization/CommittedImages';
import AppTestHarness from 'test-tools/helpers/AppTestHarness';
import FakeChildProcessGateway from 'common/FakeChildProcessGateway';

let testHarness: AppTestHarness;
let committedImages: CommittedImages;
let childProcessGateway: FakeChildProcessGateway;

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
    expect(spawnSpy.mock.calls.length).toEqual(1);
  });
});
