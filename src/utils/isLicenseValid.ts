import * as vscode from 'vscode';
import axios from 'axios';
import {
  CACHED_LICENSE_ERROR,
  CACHED_LICENSE_VALIDITY,
  LICENSE_VALIDITY_CACHED_TIME,
} from '../constants';

const licenseValidationEndpoint = 'https://getlocalci.com';
const dayInMilliseconds = 86400000;

function isCachedLicenseExpired(context: vscode.ExtensionContext): boolean {
  const cachedTimeStamp = context.globalState.get(LICENSE_VALIDITY_CACHED_TIME);
  return (
    !cachedTimeStamp ||
    new Date().getTime() - Number(cachedTimeStamp) > dayInMilliseconds
  );
}

export default async function isLicenseValid(
  context: vscode.ExtensionContext,
  licenseKey?: string | unknown
): Promise<boolean> {
  if ('' === licenseKey) {
    context.secrets.store(CACHED_LICENSE_ERROR, 'Empty license key');
    return false;
  }

  const isLicenseCacheExpired = isCachedLicenseExpired(context);
  if (
    !licenseKey &&
    true === context.globalState.get(CACHED_LICENSE_VALIDITY) &&
    !isLicenseCacheExpired
  ) {
    return true;
  }

  if (isLicenseCacheExpired) {
    await context.globalState.update(CACHED_LICENSE_VALIDITY, null);
  }

  let response = null;
  try {
    response = await axios.get(licenseValidationEndpoint, {
      params: {
        license: encodeURI(String(licenseKey)),
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
    LICENSE_VALIDITY_CACHED_TIME,
    new Date().getTime()
  );

  if (!isValid && response?.data?.error) {
    context.secrets.store(CACHED_LICENSE_ERROR, response.data.error);
  }

  return isValid;
}
