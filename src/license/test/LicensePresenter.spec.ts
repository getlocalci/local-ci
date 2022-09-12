/* eslint-disable @typescript-eslint/no-empty-function */
import type vscode from 'vscode';
import { LICENSE_VALIDITY, LICENSE_VALIDITY_CACHE_EXPIRATION } from 'constant';
import { Substitute } from '@fluffy-spoon/substitute';
import LicensePresenter from 'license/LicensePresenter';
import AppTestHarness from 'test-tools/helpers/AppTestHarness';

function getMockContext(licenseKey: string, cachedValidity: boolean) {
  const initialContext = Substitute.for<vscode.ExtensionContext>();

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

let testHarness: AppTestHarness;
let licensePresenter: LicensePresenter;

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
