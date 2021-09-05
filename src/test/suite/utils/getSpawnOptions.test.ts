import * as assert from 'assert';
import * as mocha from 'mocha';
import * as os from 'os';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import getSpawnOptions from '../../../utils/getSpawnOptions';

mocha.afterEach(() => {
  sinon.restore();
});

suite('getSpawnOptions', () => {
  test('Has working directory', () => {
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

  test('Has bin directory', () => {
    sinon.mock(os).expects('platform').once().returns('darwin');
    assert.ok(getSpawnOptions().env.PATH.includes('/usr/local/bin'));
  });
});
