import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import getLogFilePath from '../../../utils/getLogFilePath';

mocha.afterEach(() => {
  sinon.restore();
});

suite('getLogFilePath', () => {
  test('With no root path', () => {
    sinon.stub(vscode, 'workspace').value({});
    const actual = getLogFilePath('.circleci/config.yml', 'test-js');

    assert.ok(actual.match(/\/tmp\/local-ci\/logs\/test-js\/\d+\.log/));
  });

  test('With root path', () => {
    const path = 'example';
    sinon.stub(vscode, 'workspace').value({
      workspaceFolders: [{ uri: { path } }],
    });
    const actual = getLogFilePath(
      'example/another/your-repo/.circleci/config.yml  ',
      'lint-php'
    );

    assert.ok(
      actual.match(/\/tmp\/local-ci\/your-repo\/logs\/lint-php\/\d+\.log/)
    );
  });
});
