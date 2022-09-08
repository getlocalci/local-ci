import * as vscode from 'vscode';
import {
  LICENSE_VALIDITY,
  LICENSE_VALIDITY_CACHE_EXPIRATION,
} from 'constants/';
import { Substitute } from '@fluffy-spoon/substitute';
import License from 'license/License';
import AppTestHarness from 'test-tools/helpers/AppTestHarness';
const getMockContext = () => Substitute.for<vscode.ExtensionContext>();

let testHarness: AppTestHarness;
let license: License;

describe('License', () => {
  beforeEach(() => {
    testHarness = new AppTestHarness();
    testHarness.init();
    license = testHarness.container.get(License);
  });

  test('no license key', async () => {
    expect(await license.isValid(getMockContext(), true, '')).toBe(false);
  });

  test('cached license validation', async () => {
    const mockContext = getMockContext();

    expect(
      await license.isValid({
        ...mockContext,
        globalState: {
          ...mockContext.globalState,
          get: (stateKey: string) => {
            if (stateKey === LICENSE_VALIDITY) {
              return true;
            }
            if (stateKey === LICENSE_VALIDITY_CACHE_EXPIRATION) {
              return new Date().getTime();
            }
          },
          keys: () => ['foo'],
          update: async () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
          setKeysForSync: jest.fn(),
        },
        secrets: {
          ...mockContext.secrets,
          delete: async () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
          get: async () => '',
          store: jest.fn(),
        },
      })
    ).toEqual(true);
  });
});
