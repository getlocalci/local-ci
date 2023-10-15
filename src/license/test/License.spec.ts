import getContextStub from 'test-tool/helper/getContextStub';
import License from 'license/License';
import { LICENSE_VALIDITY, LICENSE_VALIDITY_CACHE_EXPIRATION } from 'constant';
import container from 'common/TestAppRoot';

let license: License;

describe('License', () => {
  beforeEach(() => {
    license = container.license;
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
