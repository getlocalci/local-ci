import * as assert from 'assert';
import * as vscode from 'vscode';
import * as sinon from 'sinon';
import getRootPath from '../../../utils/getRootPath';

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
