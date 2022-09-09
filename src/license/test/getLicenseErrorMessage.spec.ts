import getLicenseErrorMessage from 'license/getLicenseErrorMessage';

test('getLicenseErrorMessage', () => {
  expect(getLicenseErrorMessage(undefined)).toEqual('Unknown error');
  expect(getLicenseErrorMessage('missing')).toEqual('License does not exist.');
  expect(getLicenseErrorMessage('missing_url')).toEqual('URL not provided.');
  expect(getLicenseErrorMessage('disabled')).toEqual('License key revoked.');
  expect(getLicenseErrorMessage('non_existent_code')).toEqual(
    'non_existent_code'
  );
});
