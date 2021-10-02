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
  licenseKey: string | unknown,
  context: vscode.ExtensionContext
): Promise<boolean> {
  if (!licenseKey) {
    return false;
  }

  const isLicenseCacheExpired = isCachedLicenseExpired(context);
  if (
    true === context.globalState.get(CACHED_LICENSE_VALIDITY) &&
    !isLicenseCacheExpired
  ) {
    return true;
  }

  if (isLicenseCacheExpired) {
    context.globalState.update(CACHED_LICENSE_VALIDITY, null);
  }

  let response = null;
  try {
    response = await axios.post(
      `${licenseValidationEndpoint}/${String(licenseKey)}`,
      {
        license: encodeURI(String(licenseKey)),
        edd_action: 'activate_license', // eslint-disable-line @typescript-eslint/naming-convention
        item_name: 'local-ci-vscode', // eslint-disable-line @typescript-eslint/naming-convention
      }
    );
  } catch (e) {
    context.secrets.store(
      CACHED_LICENSE_ERROR,
      (e as ErrorWithMessage)?.message
    );
  }

  const isValid = response?.status === 200;
  context.globalState.update(CACHED_LICENSE_VALIDITY, isValid);
  context.globalState.update(
    LICENSE_VALIDITY_CACHED_TIME,
    new Date().getTime()
  );

  return isValid;
}
