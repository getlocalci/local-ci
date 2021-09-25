import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import { Substitute, Arg } from '@fluffy-spoon/substitute';
import * as vscode from 'vscode';
import showLicenseInput from '../../../utils/showLicenseInput';

mocha.afterEach(() => {
  sinon.restore();
});

suite('showLicenseInput', () => {
  test('license not valid', async () => {
    sinon.stub(vscode, 'window').value({
      showInputBox: async () => '',
    });

    const mockedContext = Substitute.for<vscode.ExtensionContext>();
    await showLicenseInput(mockedContext);
  });
});
