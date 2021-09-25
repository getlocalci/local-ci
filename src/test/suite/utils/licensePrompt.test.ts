import { Substitute } from '@fluffy-spoon/substitute';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import licensePrompt from '../../../utils/showLicenseInput';

mocha.afterEach(() => {
  sinon.restore();
});

suite('licensePrompt', () => {
  test('no license key', async () => {
    sinon.stub(vscode, 'window').value({
      showInputBox: async () => '',
    });

    const mockedContext = Substitute.for<vscode.ExtensionContext>();
    await licensePrompt(mockedContext);
  });
});
