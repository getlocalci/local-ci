import * as fs from 'fs';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import writeProcessFile from '../../../utils/writeProcessFile';

mocha.afterEach(() => {
  sinon.restore();
});

suite('writeProcessFile', () => {
  test('No config', () => {
    sinon.mock(fs).expects('writeFileSync').once().withArgs({});
    writeProcessFile('', '/foo/baz');
  });
});
