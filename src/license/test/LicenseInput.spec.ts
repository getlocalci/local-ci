import AppTestHarness from 'test-tools/helper/AppTestHarness';
import getContextStub from 'test-tools/helper/getContextStub';
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
    const completedCallbackSpy = jest.fn();
    const successCallbackSpy = jest.fn();
    await licenseInput.show(
      getContextStub(),
      completedCallbackSpy,
      successCallbackSpy
    );
    expect(completedCallbackSpy).toHaveBeenCalledTimes(1);
    expect(successCallbackSpy).not.toHaveBeenCalled();
  });
});
