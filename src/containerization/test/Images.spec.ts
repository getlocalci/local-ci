import getContainer from 'common/TestAppRoot';

describe('Images', () => {
  test('no error', () => {
    const { images, childProcessGateway } = getContainer();
    const spawnSpy = jest.fn();
    childProcessGateway.cp.spawn = spawnSpy;

    images.cleanUp('local-ci/lint');
    expect(spawnSpy).toHaveBeenCalledTimes(1);
  });
});
