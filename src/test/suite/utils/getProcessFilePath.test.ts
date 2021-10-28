import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import getProcessFilePath from '../../../utils/getProcessFilePath';

mocha.afterEach(() => {
  sinon.restore();
});

suite('getProcessFilePath', () => {
  test('With no root path', () => {
    sinon.stub(vscode, 'workspace').value({});
    assert.strictEqual(
      getProcessFilePath(),
      '/tmp/local-ci/process/unknown.yml'
    );
  });

  test('With root path', () => {
    const path = 'example';
    sinon.stub(vscode, 'workspace').value({
      workspaceFolders: [
        {
          uri: { path },
        },
      ],
    });

    assert.strictEqual(
      getProcessFilePath(),
      '/tmp/local-ci/process/example.yml'
    );
  });
});
