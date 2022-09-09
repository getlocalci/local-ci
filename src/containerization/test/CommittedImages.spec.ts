import CommittedImages from 'containerization/CommittedImages';
import AppTestHarness from 'test-tools/helpers/AppTestHarness';
import ChildProcessGateway from 'common/ChildProcessGateway';
import Types from 'common/Types';

let testHarness: AppTestHarness;
let committedImages: CommittedImages;
let childProcessGateway: ChildProcessGateway;

describe('CommittedImages', () => {
  beforeEach(() => {
    testHarness = new AppTestHarness();
    testHarness.init();
    committedImages = testHarness.container.get(CommittedImages);
    childProcessGateway = testHarness.container.get(Types.IChildProcessGateway);
  });

  test('no error', () => {
    const spawnSpy = jest.fn();
    childProcessGateway.cp.spawn = spawnSpy;

    committedImages.cleanUp('local-ci-lint');
    expect(spawnSpy.mock.calls.length).toEqual(1);
  });
});
