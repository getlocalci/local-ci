import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import getResultFilePath from '../../../utils/getLogFilePath';

mocha.afterEach(() => {
  sinon.restore();
});

suite('getResultFilePath', () => {
  test('With no root path', () => {
    sinon.stub(vscode, 'workspace').value({});
    assert.strictEqual(
      getResultFilePath('foo/baz/something/.circleci/config.yml', 'test-js'),
      '/tmp/local-ci/something/result/test-js/result.log'
    );
  });

  test('With root path', () => {
    const path = 'example';
    sinon.stub(vscode, 'workspace').value({
      workspaceFolders: [{ uri: { path } }],
    });

    assert.strictEqual(
      getResultFilePath(
        'example/another/your-repo/.circleci/config.yml ',
        'test-php'
      ),
      '/tmp/local-ci/your-repo/result/test-php/result.log'
    );
  });
});
