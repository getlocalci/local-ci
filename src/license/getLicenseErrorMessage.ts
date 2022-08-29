const errors = {
  missing: 'License does not exist.',
  missing_url: 'URL not provided.',
  license_not_activable:
    'Attempting to activate the parent license of a bundle.',
  disabled: 'License key revoked.',
  no_activations_left: 'No activations left.',
  expired: 'License has expired.',
  key_mismatch: 'License is not valid for this product.',
  invalid_item_id: 'Invalid Item ID.',
  item_name_mismatch: 'License is not valid for this product.',
};
type ErrorCode = keyof typeof errors;

export default function getLicenseErrorMessage(
  errorCode: string | undefined
): string {
  if (!errorCode) {
    return 'Unknown error';
  }

  if (errors[errorCode as ErrorCode]) {
    return errors[errorCode as ErrorCode];
  }

  if (errorCode.includes('ENOTFOUND')) {
    return `Please double-check your internet connection: ${errorCode}`;
  }

  return errorCode;
}
