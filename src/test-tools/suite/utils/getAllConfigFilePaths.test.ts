/* eslint-disable @typescript-eslint/no-empty-function */
import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { Substitute } from '@fluffy-spoon/substitute';
import getAllConfigFilePaths from 'config/getAllConfigFilePaths';

mocha.afterEach(() => {
  sinon.restore();
});

function getMockContext(filePath: string) {
  const initialContext = Substitute.for<vscode.ExtensionContext>();

  return {
    ...initialContext,
    globalState: {
      ...initialContext.globalState,
      get: () => {
        return filePath;
      },
      update: async () => {},
    },
  };
}

suite('getAllConfigFilePaths', () => {
  test('stored config file', async () => {
    const selectedFilePath = '/baz/bar/ex';
    sinon.stub(vscode, 'workspace').value({
      findFiles: () =>
        Promise.resolve([
          { fsPath: '/path/to/here' },
          { fsPath: selectedFilePath },
        ]),
      asRelativePath: (path: string) => path,
    });

    const actual = await getAllConfigFilePaths(
      getMockContext(selectedFilePath)
    );
    assert.strictEqual(actual[0].fsPath, selectedFilePath);
    assert.ok(actual[0].label);
    assert.ok(actual[0].description);
  });
});
