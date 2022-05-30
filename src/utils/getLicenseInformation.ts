import * as vscode from 'vscode';
import getLicenseErrorMessage from './getLicenseErrorMessage';
import getTimeRemainingInTrial from './getTimeRemainingInTrial';
import getTrialLength from './getTrialLength';
import isLicenseValid from './isLicenseValid';
import isTrialExpired from './isTrialExpired';
import {
  EXTENDED_TRIAL_LENGTH_IN_MILLISECONDS,
  GET_LICENSE_KEY_URL,
  HAS_EXTENDED_TRIAL,
  LICENSE_ERROR,
  LICENSE_KEY,
  LICENSE_VALIDITY,
  SCHEDULE_INTERVIEW_URL,
  TRIAL_STARTED_TIMESTAMP,
} from '../constants';

export default async function getLicenseInformation(
  context: vscode.ExtensionContext
): Promise<string> {
  context.secrets.delete(LICENSE_VALIDITY);
  const previewStartedTimeStamp = context.globalState.get(
    TRIAL_STARTED_TIMESTAMP
  );
  const dayInMilliseconds = 86400000;
  const licenseKey = await context.secrets.get(LICENSE_KEY);
  const getLicenseLink = `<a class="button secondary" href="${GET_LICENSE_KEY_URL}" target="_blank">Buy license</a>`;
  const enterLicenseButton = `<button class="secondary" id="enter-license">Enter license key</button>`;
  const changeLicenseButton = `<button class="secondary" id="enter-license">Change license key</button>`;
  const retryValidationButton = `<button class="secondary" id="retry-license-validation">Retry license validation</button>`;
  const takeSurveyButton = `<button class="button primary" id="take-survey">Get ${
    EXTENDED_TRIAL_LENGTH_IN_MILLISECONDS / dayInMilliseconds
  } more free days by taking a 2-minute anonymous survey</button>`;
  const scheduleInterviewLink = `<a class="button primary" href="${SCHEDULE_INTERVIEW_URL}" target="_blank">Get a free lifetime license by doing a 30-minute Zoom user research interview</a>`;
  const complainUri = 'mailto:ryan@getlocalci.com';
  const complainLink = `<a class="button secondary" href="${complainUri}" target="_blank">Complain to me</a>`;

  const isValid = await isLicenseValid(context);
  const hasExtendedTrial = !!context.globalState.get(HAS_EXTENDED_TRIAL);
  const trialLengthInMilliseconds = getTrialLength(context);
  const isPreviewExpired = isTrialExpired(
    previewStartedTimeStamp,
    trialLengthInMilliseconds
  );

  const shouldOfferInterview = isTrialExpired(
    previewStartedTimeStamp,
    trialLengthInMilliseconds + 3 * dayInMilliseconds
  );

  const shouldOfferSurvey =
    !hasExtendedTrial &&
    isTrialExpired(
      previewStartedTimeStamp,
      trialLengthInMilliseconds + 1 * dayInMilliseconds
    );

  if (isValid) {
    return `<p>Your Local CI license key is valid!</p>
      <p>${changeLicenseButton}</p>
      <p>${complainLink}</p>`;
  }

  if (isPreviewExpired && !!licenseKey && !isValid) {
    return `<p>There was an error validating the license key.</p>
    <p>${getLicenseErrorMessage(await context.secrets.get(LICENSE_ERROR))}</p>
    <p>${getLicenseLink}</p>
    <p>${enterLicenseButton}</p>
    ${shouldOfferSurvey ? `<p>${takeSurveyButton}</p>` : ''}
    <p>${retryValidationButton}</p>
    <p>${complainLink}</p>`;
  }

  if (shouldOfferInterview) {
    return `<p>${scheduleInterviewLink}</p>
      <p>No sales pitch, I have nothing to sell you after giving you the free lifetime license.</p>
      <p>${enterLicenseButton}</p>`;
  }

  if (isPreviewExpired) {
    return `<p>Thanks for previewing Local CI! The free preview is over.</p>
      <p>Please enter a Local CI license key to keep using this.</p>
      ${shouldOfferSurvey ? `<p>${takeSurveyButton}</p>` : ''}
      <p>${getLicenseLink}</p>
      <p>${enterLicenseButton}</p>
      <p>${complainLink}</p>`;
  }

  return `<p>Thanks for previewing Local CI!</p>
    <p>${getTimeRemainingInTrial(
      new Date().getTime(),
      context.globalState.get(TRIAL_STARTED_TIMESTAMP),
      trialLengthInMilliseconds
    )} left in this free preview.</p>
    <p>${getLicenseLink}</p>
    <p>${enterLicenseButton}</p>
    <p>${complainLink}</p>`;
}
