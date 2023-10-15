import getContainer from 'test-tool/TestRoot';

describe('Images', () => {
  test('no error', () => {
    const { images, childProcessGateway } = getContainer();
    const spawnSpy = jest.fn();
    childProcessGateway.cp.spawn = spawnSpy;

    images.cleanUp('local-ci/lint');
    expect(spawnSpy).toHaveBeenCalledTimes(1);
  });
});
