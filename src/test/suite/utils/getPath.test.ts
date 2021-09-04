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
    sinon.mock(os).expects('platform').once().returns('linux');
    sinon.stub(process, 'env').value({ PATH: '' }); // eslint-disable-line @typescript-eslint/naming-convention
    assert.strictEqual('', getPath());
  });

  test('On Mac without the bin path', () => {
    sinon.mock(os).expects('platform').once().returns('darwin');
    sinon.stub(process, 'env').value({ PATH: 'Users/Foo/' }); // eslint-disable-line @typescript-eslint/naming-convention
    assert.strictEqual('Users/Foo/:/usr/local/bin', getPath());
  });

  test('On Mac with the bin path', () => {
    sinon.mock(os).expects('platform').once().returns('darwin');
    sinon.stub(process, 'env').value({ PATH: 'Users/Foo/:/usr/local/bin' }); // eslint-disable-line @typescript-eslint/naming-convention
    assert.strictEqual('Users/Foo/:/usr/local/bin', getPath());
  });
});
