import * as vscode from 'vscode';
import axios from 'axios';
import {
  CACHED_LICENSE_ERROR,
  CACHED_LICENSE_VALIDITY,
  LICENSE_VALIDITY_CACHE_EXPIRATION,
} from '../constants';

const licenseValidationEndpoint = 'https://getlocalci.com';
const fiveMinutesInMilliseconds = 300000;
const dayInMilliseconds = 86400000;

function isCachedValidityExpired(context: vscode.ExtensionContext): boolean {
  const expiration = context.globalState.get(LICENSE_VALIDITY_CACHE_EXPIRATION);
  return typeof expiration === 'number' && new Date().getTime() > expiration;
}

export default async function isLicenseValid(
  context: vscode.ExtensionContext,
  licenseKey?: string | unknown
): Promise<boolean> {
  if ('' === licenseKey) {
    context.secrets.store(CACHED_LICENSE_ERROR, 'Empty license key');
    return false;
  }
  const trimmedLicenseKey = licenseKey ? String(licenseKey).trim() : '';

  const isLicenseCacheExpired = isCachedValidityExpired(context);
  if (!trimmedLicenseKey && !isLicenseCacheExpired) {
    return !!context.globalState.get(CACHED_LICENSE_VALIDITY);
  }

  let response = null;
  try {
    response = await axios.get(licenseValidationEndpoint, {
      params: {
        license: encodeURI(String(trimmedLicenseKey)),
        edd_action: 'activate_license', // eslint-disable-line @typescript-eslint/naming-convention
        item_id: 43, // eslint-disable-line @typescript-eslint/naming-convention
        url: 'https://example.com',
      },
    });
  } catch (e) {
    context.secrets.store(
      CACHED_LICENSE_ERROR,
      (e as ErrorWithMessage)?.message
    );
  }

  const isValid = !!response?.data?.success;
  context.globalState.update(CACHED_LICENSE_VALIDITY, isValid);
  context.globalState.update(
    LICENSE_VALIDITY_CACHE_EXPIRATION,
    new Date().getTime() +
      (isValid ? dayInMilliseconds : fiveMinutesInMilliseconds)
  );

  if (!isValid && response?.data?.error) {
    context.secrets.store(CACHED_LICENSE_ERROR, response.data.error);
  }

  return isValid;
}
