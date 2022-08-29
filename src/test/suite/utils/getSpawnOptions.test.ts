import * as assert from 'assert';
import * as mocha from 'mocha';
import * as os from 'os';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import getSpawnOptions from 'common/getSpawnOptions';

mocha.afterEach(() => {
  sinon.restore();
});

suite('getSpawnOptions', () => {
  test('has working directory', () => {
    sinon.mock(os).expects('platform').once().returns('darwin');
    const path = 'example';
    sinon.stub(vscode, 'workspace').value({
      workspaceFolders: [
        {
          uri: { path },
        },
      ],
    });
    assert.strictEqual(getSpawnOptions().cwd, path);
  });

  test('has bin directory', () => {
    sinon.mock(os).expects('platform').once().returns('darwin');
    assert.ok(getSpawnOptions().env.PATH.includes('/usr/local/bin'));
  });

  test('with cwd argument', () => {
    assert.strictEqual(getSpawnOptions('/foo/baz').cwd, '/foo/baz');
  });
});
