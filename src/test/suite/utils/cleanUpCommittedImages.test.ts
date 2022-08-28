import * as cp from 'child_process';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import cleanUpCommittedImages from '../../../utils/cleanUpCommittedImages';

mocha.afterEach(() => {
  sinon.restore();
});

suite('cleanUpCommittedImages', () => {
  test('no error', () => {
    sinon.mock(cp).expects('spawnSync').twice();
    cleanUpCommittedImages('local-ci-lint');
  });
});
