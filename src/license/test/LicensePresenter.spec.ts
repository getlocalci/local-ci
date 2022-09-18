/* eslint-disable @typescript-eslint/no-empty-function */
import AppTestHarness from 'test-tool/helpers/AppTestHarness';
import LicensePresenter from 'license/LicensePresenter';
import { LICENSE_VALIDITY, LICENSE_VALIDITY_CACHE_EXPIRATION } from 'constant';
import getContextStub from 'test-tool/helpers/getContextStub';

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

let licensePresenter: LicensePresenter;
let testHarness: AppTestHarness;

describe('LicensePresenter', () => {
  beforeEach(() => {
    testHarness = new AppTestHarness();
    testHarness.init();
    licensePresenter = testHarness.container.get(LicensePresenter);
  });

  test('no license', async () => {
    expect(
      (await licensePresenter.getView(getMockContext('', false))).includes(
        'Enter license key'
      )
    );
  });

  test('cached valid license', async () => {
    const actual = await licensePresenter.getView(
      getMockContext('123456789', true)
    );
    expect(actual.includes('Enter license key')).toEqual(false);
    expect(actual.includes('Your Local CI license key is valid'));
  });
});
