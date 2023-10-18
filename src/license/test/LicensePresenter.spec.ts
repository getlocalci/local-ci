/* eslint-disable @typescript-eslint/no-empty-function */
import { LICENSE_VALIDITY, LICENSE_VALIDITY_CACHE_EXPIRATION } from 'constant';
import getContextStub from 'test-tool/helper/getContextStub';
import getContainer from 'test-tool/TestRoot';

function getMockContext(licenseKey: string, cachedValidity: boolean) {
  const initialContext = getContextStub();

  return {
    ...initialContext,
    globalState: {
      ...initialContext.globalState,
      get: (stateKey: string) => {
        if (stateKey === LICENSE_VALIDITY) {
          return cachedValidity;
        }
        if (stateKey === LICENSE_VALIDITY_CACHE_EXPIRATION) {
          return { cachedTime: new Date().getTime() };
        }
      },
      keys: () => ['foo'],
      update: async () => {},
      setKeysForSync: jest.fn(),
    },
    secrets: {
      ...initialContext.secrets,
      delete: async () => {},
      get: async () => licenseKey,
      store: jest.fn(),
    },
  };
}

describe('LicensePresenter', () => {
  test('no license', async () => {
    const { licensePresenter } = getContainer();
    expect(
      (await licensePresenter.getView(getMockContext('', false))).includes(
        'Enter license key'
      )
    );
  });

  test('cached valid license', async () => {
    const { licensePresenter } = getContainer();
    const actual = await licensePresenter.getView(
      getMockContext('123456789', true)
    );
    expect(actual.includes('Enter license key')).toEqual(false);
    expect(actual.includes('Your Local CI license key is valid'));
  });
});
