import getLicenseErrorMessage from 'license/getLicenseErrorMessage';

describe('getLicenseErrorMessage', () => {
  it.each([
    [undefined, 'Unknown error'],
    ['missing', 'License does not exist.'],
    ['missing_url', 'URL not provided.'],
    ['disabled', 'License key revoked.'],
    ['non_existent_code', 'non_existent_code'],
  ])('should have the correct message', (errorCode, expectedMessage) => {
    expect(getLicenseErrorMessage(errorCode)).toEqual(expectedMessage);
  });
});
