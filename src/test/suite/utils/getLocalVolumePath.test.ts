import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import getLocalVolumePath from '../../../utils/getLocalVolumePath';

mocha.afterEach(() => {
  sinon.restore();
});

suite('getLocalVolumePath', () => {
  test('With no root path', () => {
    sinon.stub(vscode, 'workspace').value({});
    assert.strictEqual(getLocalVolumePath(), '/tmp/local-ci/volume/unknown');
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

    assert.strictEqual(getLocalVolumePath(), '/tmp/local-ci/volume/example');
  });
});
