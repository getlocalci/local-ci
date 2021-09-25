import { Substitute } from '@fluffy-spoon/substitute';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import showLicenseInput from '../../../utils/showLicenseInput';

mocha.afterEach(() => {
  sinon.restore();
});

suite('showLicenseInput', () => {
  test('license not valid', async () => {
    sinon.stub(vscode, 'window').value({
      showInputBox: async () => '',
      showWarningMessage: async () => '',
    });

    const mockedContext = Substitute.for<vscode.ExtensionContext>();
    await showLicenseInput(mockedContext);
  });
});
