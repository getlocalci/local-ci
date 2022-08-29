/* eslint-disable @typescript-eslint/no-empty-function */
import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { Substitute } from '@fluffy-spoon/substitute';
import getConfigFilePath from 'utils/config/getConfigFilePath';

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

suite('getConfigFilePath', () => {
  test('stored config file', async () => {
    sinon.stub(vscode, 'workspace').value({
      getWorkspaceFolder: () => ({ name: 'example' }),
    });
    assert.strictEqual(
      await getConfigFilePath(getMockContext('/home/example/baz')),
      '/home/example/baz'
    );
  });
});
