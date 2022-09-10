import * as vscode from 'vscode';
import { Substitute } from '@fluffy-spoon/substitute';
import AppTestHarness from 'test-tools/helpers/AppTestHarness';
import LicenseInput from 'license/LicenseInput';

let testHarness: AppTestHarness;
let licenseInput: LicenseInput;

describe('LicenseInput', () => {
  beforeEach(() => {
    testHarness = new AppTestHarness();
    testHarness.init();
    licenseInput = testHarness.container.get(LicenseInput);
  });

  test('license is not valid', async () => {
    const mockedContext = Substitute.for<vscode.ExtensionContext>();
    const completedCallbackSpy = jest.fn();
    const successCallbackSpy = jest.fn();
    await licenseInput.show(
      mockedContext,
      completedCallbackSpy,
      successCallbackSpy
    );
    expect(completedCallbackSpy.mock.calls.length).toEqual(1);
    expect(successCallbackSpy.mock.calls.length).toEqual(0);
  });
});
