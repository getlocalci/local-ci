import * as assert from 'assert';
import * as os from 'os';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import getPath from '../../../utils/getPath';

mocha.afterEach(() => {
  sinon.restore();
});

suite('getPath', () => {
  test('On Linux', () => {
    sinon.mock(os).expects('type').once().returns('Linux');
    sinon.stub(process, 'env').value({ PATH: '' });
    assert.strictEqual(getPath(), '');
  });

  test('On Mac without the bin path', () => {
    sinon.mock(os).expects('type').once().returns('Darwin');
    sinon.stub(process, 'env').value({ PATH: 'Users/Foo/' });
    assert.strictEqual(getPath(), 'Users/Foo/:/usr/local/bin');
  });

  test('On Mac with the bin path', () => {
    sinon.mock(os).expects('type').once().returns('Darwin');
    sinon.stub(process, 'env').value({ PATH: 'Users/Foo/:/usr/local/bin' });
    assert.strictEqual(getPath(), 'Users/Foo/:/usr/local/bin');
  });
});
