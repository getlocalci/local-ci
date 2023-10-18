import getContextStub from 'test-tool/helper/getContextStub';
import { LICENSE_VALIDITY, LICENSE_VALIDITY_CACHE_EXPIRATION } from 'constant';
import getContainer from 'test-tool/TestRoot';

describe('License', () => {
  test('no license key', async () => {
    const { license } = getContainer();
    expect(await license.isValid(getContextStub(), true, '')).toBe(false);
  });

  test('cached license validation', async () => {
    const { license } = getContainer();
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
