import getContextStub from 'test-tool/helper/getContextStub';
import LicenseInput from 'license/LicenseInput';
import container from 'common/TestAppRoot';

let licenseInput: LicenseInput;

describe('LicenseInput', () => {
  beforeEach(() => {
    licenseInput = container.licenseInput;
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
