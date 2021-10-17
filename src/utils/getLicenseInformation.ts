import * as vscode from 'vscode';
import getHoursRemainingInPreview from './getHoursRemainingInPreview';
import isPreviewExpired from './isPreviewExpired';
import {
  GET_LICENSE_KEY_URL,
  LICENSE_ERROR,
  LICENSE_KEY,
  LICENSE_VALIDITY,
  TRIAL_STARTED_TIMESTAMP,
} from '../constants';
import isLicenseValid from './isLicenseValid';
import getLicenseErrorMessage from './getLicenseErrorMessage';

function getTextForNumber(singular: string, plural: string, count: number) {
  return count === 1 ? singular : plural;
}

export default async function getLicenseInformation(
  context: vscode.ExtensionContext
): Promise<string> {
  context.secrets.delete(LICENSE_VALIDITY);
  const previewStartedTimeStamp = context.globalState.get(
    TRIAL_STARTED_TIMESTAMP
  );
  const licenseKey = await context.secrets.get(LICENSE_KEY);
  const getLicenseLink = `<a class="button" href="${GET_LICENSE_KEY_URL}" target="_blank" rel="noopener noreferrer">Buy license</a>`;
  const enterLicenseButton = `<button class="secondary" id="enter-license">Enter license key</button>`;
  const changeLicenseButton = `<button class="secondary" id="enter-license">Change license key</button>`;
  const retryValidationButton = `<button class="secondary" id="retry-license-validation">Retry license validation</button>`;

  const isValid = await isLicenseValid(context);
  const previewExpired = isPreviewExpired(previewStartedTimeStamp);

  if (isValid) {
    return `<p>Your Local CI license key is valid!</p>
      ${changeLicenseButton}`;
  }

  if (!previewStartedTimeStamp && !licenseKey) {
    context.globalState.update(TRIAL_STARTED_TIMESTAMP, new Date().getTime());
    return `<p>Thanks for previewing Local CI!</p>
      <p>This free trial will last for 2 days, then it will require a purchased license key.</p>
      <p>${getLicenseLink}</p>
      <p>${enterLicenseButton}</p>`;
  }

  if (previewExpired && !!licenseKey && !isValid) {
    return `<p>There was an error validating the license key.</p>
    <p>${getLicenseErrorMessage(
      String(await context.secrets.get(LICENSE_ERROR))
    )}</p>
    <p>${getLicenseLink}</p>
    <p>${enterLicenseButton}</p>
    <p>${retryValidationButton}</p>`;
  }

  if (previewExpired) {
    return `<p>Thanks for previewing Local CI! The free trial is over.</p>
      <p>Please enter a Local CI license key to keep using this.</p>
      <p>${getLicenseLink}</p>
      <p>${enterLicenseButton}</p>`;
  }

  const timeRemaining = getHoursRemainingInPreview(
    new Date().getTime(),
    previewStartedTimeStamp
  );

  return `<p>Thanks for previewing Local CI!</p>
    <p>${getTextForNumber(
      `Your free trial has ${timeRemaining} hour left.`,
      `Your free trial has ${timeRemaining} hours left.`,
      timeRemaining
    )}</p>
    <p>${getLicenseLink}</p>
    <p>${enterLicenseButton}</p>`;
}
