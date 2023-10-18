import type vscode from 'vscode';
import getLicenseErrorMessage from './getLicenseErrorMessage';
import getTimeRemainingInTrial from './getTimeRemainingInTrial';
import getTrialLength from './getTrialLength';
import isTrialExpired from './isTrialExpired';
import License from './License';
import {
  DAY_IN_MILLISECONDS,
  GET_LICENSE_KEY_URL,
  LICENSE_ERROR,
  LICENSE_KEY,
  LICENSE_VALIDITY,
  SCHEDULE_INTERVIEW_URL,
  TRIAL_STARTED_TIMESTAMP,
} from 'constant';

export default class LicensePresenter {
  constructor(public license: License) {}

  async getView(context: vscode.ExtensionContext): Promise<string> {
    context.secrets.delete(LICENSE_VALIDITY);
    const trialStartedTimeStamp = context.globalState.get(
      TRIAL_STARTED_TIMESTAMP
    );
    const licenseKey = await context.secrets.get(LICENSE_KEY);
    const getLicenseLink = `<a class="button secondary" href="${GET_LICENSE_KEY_URL}" target="_blank">Buy license</a>`;
    const enterLicenseButton = `<button class="secondary" id="enter-license">Enter license key</button>`;
    const changeLicenseButton = `<button class="secondary" id="enter-license">Change license key</button>`;
    const retryValidationButton = `<button class="secondary" id="retry-license-validation">Retry license validation</button>`;
    const scheduleInterviewLink = `<a class="button primary" href="${SCHEDULE_INTERVIEW_URL}" target="_blank">Get a free lifetime license by doing a 30-minute Zoom user research interview</a>`;
    const complainUri = 'mailto:ryan@getlocalci.com';
    const complainLink = `<a class="button secondary" href="${complainUri}" target="_blank">Complain to me</a>`;

    const isValid = await this.license.isValid(context);
    const trialLengthInMilliseconds = getTrialLength(context);
    const isExpired = isTrialExpired(
      trialStartedTimeStamp,
      trialLengthInMilliseconds
    );

    const shouldOfferInterview = isTrialExpired(
      trialStartedTimeStamp,
      trialLengthInMilliseconds + 40 * DAY_IN_MILLISECONDS
    );

    if (isValid) {
      return `<p>Your Local CI license key is valid!</p>
        <p>${changeLicenseButton}</p>
        <p>${complainLink}</p>`;
    }

    if (isExpired && !!licenseKey && !isValid) {
      return `<p>There was an error validating the license key.</p>
      <p>${getLicenseErrorMessage(await context.secrets.get(LICENSE_ERROR))}</p>
      <p>${getLicenseLink}</p>
      <p>${enterLicenseButton}</p>
      <p>${retryValidationButton}</p>
      <p>${complainLink}</p>`;
    }

    if (shouldOfferInterview) {
      return `<p>${scheduleInterviewLink}</p>
        <p>No sales pitch, I have nothing to sell you after giving you the free lifetime license.</p>
        <p>${enterLicenseButton}</p>`;
    }

    if (isExpired) {
      return `<p>Thanks for trying Local CI! The free trial is over.</p>
        <p>Please enter a Local CI license key to keep using this.</p>
        <p>${getLicenseLink}</p>
        <p>${enterLicenseButton}</p>
        <p>${complainLink}</p>`;
    }

    return `<p>Thanks for trying Local CI!</p>
      <p>${getTimeRemainingInTrial(
        new Date().getTime(),
        context.globalState.get(TRIAL_STARTED_TIMESTAMP),
        trialLengthInMilliseconds
      )} left in this free trial.</p>
      <p>${getLicenseLink}</p>
      <p>${enterLicenseButton}</p>
      <p>${complainLink}</p>`;
  }
}
