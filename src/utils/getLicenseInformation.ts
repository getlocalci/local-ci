import * as vscode from 'vscode';
import getHoursRemainingInPreview from './getHoursRemainingInPreview';
import isPreviewExpired from './isPreviewExpired';
import { GET_LICENSE_KEY_URL, LICENSE_KEY_STATE } from '../constants';
import isLicenseValid from './isLicenseValid';

const whenPreviewStarted = 'localCi:license:whenPreviewStarted';

function getTextForNumber(singular: string, plural: string, count: number) {
  return count === 1 ? singular : plural;
}

export default function getLicenseInformation(
  context: vscode.ExtensionContext
): string {
  const previewStartedTimeStamp = context.globalState.get(whenPreviewStarted);
  const licenseKey = context.globalState.get(LICENSE_KEY_STATE);
  const getLicenseLink = `<a class="button" href="${GET_LICENSE_KEY_URL}" target="_blank" rel="noopener noreferrer">Buy license</a>`;
  const enterLicenseButton = `<button class="secondary" id="enter-license">Enter license</button>`;

  if (isLicenseValid(licenseKey)) {
    return `<p>Your Local CI license key is valid!</p>`;
  }

  if (!previewStartedTimeStamp && !licenseKey) {
    context.globalState.update(whenPreviewStarted, new Date().getTime());
    return `<p>Thanks for previewing Local CI!</p>
      <p>This free trial will last for 2 days, then it will require a purchased license key.</p>
      <p>${getLicenseLink}</p>
      <p>${enterLicenseButton}</p>`;
  }

  if (!isPreviewExpired(previewStartedTimeStamp)) {
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

  if (isPreviewExpired(previewStartedTimeStamp) && !licenseKey) {
    return `<p>Thanks for previewing Local CI!</p>
      <p>Please enter a Local CI license key to keep using this.</p>
      <p>${getLicenseLink}</p>
      <p>${enterLicenseButton}</p>`;
  }

  return '';
}
