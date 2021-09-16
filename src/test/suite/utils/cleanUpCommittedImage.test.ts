import * as cp from 'child_process';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import cleanUpCommittedImage from '../../../utils/cleanUpCommittedImage';

mocha.afterEach(() => {
  sinon.restore();
});

suite('cleanUpCommittedImage', () => {
  test('No error', () => {
    sinon.mock(cp).expects('spawnSync').twice();

    cleanUpCommittedImage('local-ci-lint');
  });
});
