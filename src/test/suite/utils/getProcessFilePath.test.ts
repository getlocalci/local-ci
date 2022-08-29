import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import getProcessFilePath from 'process/getProcessFilePath';

mocha.afterEach(() => {
  sinon.restore();
});

suite('getProcessFilePath', () => {
  test('With no root path', () => {
    sinon.stub(vscode, 'workspace').value({});
    assert.strictEqual(
      getProcessFilePath('foo/baz/something/.circleci/config.yml'),
      '/tmp/local-ci/something/process.yml'
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
      getProcessFilePath('example/another/local-ci/.circleci/config.yml '),
      '/tmp/local-ci/local-ci/process.yml'
    );
  });
});
