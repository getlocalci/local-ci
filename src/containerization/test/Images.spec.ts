import Images from 'containerization/Images';
import ChildProcessGateway from 'gateway/ChildProcessGateway';
import container from 'common/TestAppRoot';
let childProcessGateway: ChildProcessGateway;
let images: Images;

describe('Images', () => {
  beforeEach(() => {
    images = container.images;
    childProcessGateway = container.childProcessGateway;
  });

  test('no error', () => {
    const spawnSpy = jest.fn();
    childProcessGateway.cp.spawn = spawnSpy;

    images.cleanUp('local-ci/lint');
    expect(spawnSpy).toHaveBeenCalledTimes(1);
  });
});
