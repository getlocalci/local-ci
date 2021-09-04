import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import getRootPath from '../../../utils/getRootPath';

mocha.afterEach(() => {
  sinon.restore();
});

suite('getRootPath', () => {
  test('With no workspaceFolders', () => {
    sinon.stub(vscode, 'workspace').value({});
    assert.strictEqual('', getRootPath());
  });

  test('With workspaceFolders', () => {
    const path = 'example';
    sinon.stub(vscode, 'workspace').value({
      workspaceFolders: [
        {
          uri: { path },
        },
      ],
    });

    assert.strictEqual(path, getRootPath());
  });
});
