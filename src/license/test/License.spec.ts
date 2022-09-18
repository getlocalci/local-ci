import AppTestHarness from 'test-tools/helper/AppTestHarness';
import getContextStub from 'test-tools/helper/getContextStub';
import License from 'license/License';
import { LICENSE_VALIDITY, LICENSE_VALIDITY_CACHE_EXPIRATION } from 'constant';

let testHarness: AppTestHarness;
let license: License;

describe('License', () => {
  beforeEach(() => {
    testHarness = new AppTestHarness();
    testHarness.init();
    license = testHarness.container.get(License);
  });

  test('no license key', async () => {
    expect(await license.isValid(getContextStub(), true, '')).toBe(false);
  });

  test('cached license validation', async () => {
    const mockContext = getContextStub();

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
