import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import getFirstWorkspaceRootPath from '../../../utils/common/getFirstWorkspaceRootPath';

mocha.afterEach(() => {
  sinon.restore();
});

suite('getFirstWorkspaceRootPath', () => {
  test('with no workspaceFolders', () => {
    sinon.stub(vscode, 'workspace').value({});
    assert.strictEqual(getFirstWorkspaceRootPath(), '');
  });

  test('Wwith workspaceFolders', () => {
    const path = 'example';
    sinon.stub(vscode, 'workspace').value({
      workspaceFolders: [
        {
          uri: { path },
        },
      ],
    });

    assert.strictEqual(getFirstWorkspaceRootPath(), path);
  });
});
