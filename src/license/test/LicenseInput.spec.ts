import getContextStub from 'test-tool/helper/getContextStub';
import getContainer from 'test-tool/TestRoot';

describe('LicenseInput', () => {
  test('license is not valid', async () => {
    const { licenseInput } = getContainer();
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
