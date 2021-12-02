import * as vscode from 'vscode';
import getLicenseErrorMessage from './getLicenseErrorMessage';
import getPrettyPrintedTimeRemaining from './getPrettyPrintedTimeRemaining';
import getTimeRemainingInTrial from './getTimeRemainingInTrial';
import getTrialLength from './getTrialLength';
import isLicenseValid from './isLicenseValid';
import isTrialExpired from './isTrialExpired';
import {
  GET_LICENSE_KEY_URL,
  LICENSE_ERROR,
  LICENSE_KEY,
  LICENSE_VALIDITY,
  TRIAL_STARTED_TIMESTAMP,
  HAS_EXTENDED_TRIAL,
  EXTENDED_TRIAL_LENGTH_IN_MILLISECONDS,
} from '../constants';

export default async function getLicenseInformation(
  context: vscode.ExtensionContext
): Promise<string> {
  context.secrets.delete(LICENSE_VALIDITY);
  const previewStartedTimeStamp = context.globalState.get(
    TRIAL_STARTED_TIMESTAMP
  );
  const daysInMilliseconds = 86400000;
  const licenseKey = await context.secrets.get(LICENSE_KEY);
  const getLicenseLink = `<a class="button secondary" href="${GET_LICENSE_KEY_URL}" target="_blank" rel="noopener noreferrer">Buy license</a>`;
  const enterLicenseButton = `<button class="secondary" id="enter-license">Enter license key</button>`;
  const changeLicenseButton = `<button class="secondary" id="enter-license">Change license key</button>`;
  const retryValidationButton = `<button class="secondary" id="retry-license-validation">Retry license validation</button>`;
  const takeSurveyButton = `<button class="button primary" id="take-survey">Get ${
    EXTENDED_TRIAL_LENGTH_IN_MILLISECONDS / daysInMilliseconds
  } more free days by taking a 2-minute anonymous survey</button>`;

  const isValid = await isLicenseValid(context);
  const hasExtendedTrial = !!context.globalState.get(HAS_EXTENDED_TRIAL);
  const trialLengthInMilliseconds = getTrialLength(context);
  const isPreviewExpired = isTrialExpired(
    previewStartedTimeStamp,
    trialLengthInMilliseconds
  );

  if (isValid) {
    return `<p>Your Local CI license key is valid!</p>
      ${changeLicenseButton}`;
  }

  if (!previewStartedTimeStamp && !licenseKey) {
    context.globalState.update(TRIAL_STARTED_TIMESTAMP, new Date().getTime());
    return `<p>Thanks for previewing Local CI!</p>
      <p>This free trial will last for ${getPrettyPrintedTimeRemaining(
        trialLengthInMilliseconds
      )}.</p>
      ${hasExtendedTrial ? '' : `<p>${takeSurveyButton}</p>`}
      <p>${getLicenseLink}</p>
      <p>${enterLicenseButton}</p>`;
  }

  if (isPreviewExpired && !!licenseKey && !isValid) {
    return `<p>There was an error validating the license key.</p>
    <p>${getLicenseErrorMessage(
      String(await context.secrets.get(LICENSE_ERROR))
    )}</p>
    <p>${getLicenseLink}</p>
    <p>${enterLicenseButton}</p>
    ${hasExtendedTrial ? '' : `<p>${takeSurveyButton}</p>`}
    <p>${retryValidationButton}</p>`;
  }

  if (isPreviewExpired) {
    return `<p>Thanks for previewing Local CI! The free preview is over.</p>
      <p>Please enter a Local CI license key to keep using this.</p>
      ${hasExtendedTrial ? '' : `<p>${takeSurveyButton}</p>`}
      <p>${getLicenseLink}</p>
      <p>${enterLicenseButton}</p>`;
  }

  return `<p>Thanks for previewing Local CI!</p>
    <p>${getTimeRemainingInTrial(
      new Date().getTime(),
      context.globalState.get(TRIAL_STARTED_TIMESTAMP),
      trialLengthInMilliseconds
    )} left in this free preview.</p>
    ${hasExtendedTrial ? '' : `<p>${takeSurveyButton}</p>`}
    <p>${getLicenseLink}</p>
    <p>${enterLicenseButton}</p>`;
}
