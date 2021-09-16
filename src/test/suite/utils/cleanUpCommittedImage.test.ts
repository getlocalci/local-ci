import * as cp from 'child_process';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import cleanUpCommittedImage from '../../../utils/cleanUpCommittedImage';
import getSpawnOptions from '../../../utils/getSpawnOptions';

mocha.afterEach(() => {
  sinon.restore();
});

suite('cleanUpCommittedImage', () => {
  test('No error', () => {
    const imageName = 'local-ci-lint';
    sinon
      .mock(cp)
      .expects('spawnSync')
      .once()
      .withArgs('docker', ['rmi', imageName], getSpawnOptions());

    sinon.mock(cp).expects('spawnSync').once();

    cleanUpCommittedImage(imageName);
  });
});
