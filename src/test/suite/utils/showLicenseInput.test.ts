import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { Substitute } from '@fluffy-spoon/substitute';
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
    const completedCallbackSpy = sinon.spy();
    const successCallbackSpy = sinon.spy();
    await showLicenseInput(
      mockedContext,
      completedCallbackSpy,
      successCallbackSpy
    );
    assert.ok(completedCallbackSpy.called);
    assert.strictEqual(successCallbackSpy.called, false);
  });
});
