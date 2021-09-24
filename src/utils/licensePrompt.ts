import * as vscode from 'vscode';
import getHoursRemainingInPreview from './getHoursRemainingInPreview';
import isPreviewExpired from './isPreviewExpired';
import showLicenseInput from './showLicenseInput';
import { LICENSE_KEY_STATE } from '../constants';

const getLicense = 'Buy License';
const enterLicense = 'Enter License';
const whenPreviewStarted = 'localCi:license:whenPreviewStarted';

function handleSelection(
  userSelection: string | undefined,
  context: vscode.ExtensionContext
) {
  if (userSelection === getLicense) {
    vscode.env.openExternal(vscode.Uri.parse('https://getlocalci.com'));
  }

  if (userSelection === enterLicense) {
    showLicenseInput(context);
  }
}

function getTextForNumber(singular: string, plural: string, count: number) {
  return count === 1 ? singular : plural;
}

export default async function licensePrompt(
  context: vscode.ExtensionContext
): Promise<void> {
  const previewStartedTimeStamp = context.globalState.get(whenPreviewStarted);
  const licenseKey = context.globalState.get(LICENSE_KEY_STATE);

  if (!previewStartedTimeStamp && !licenseKey) {
    context.globalState.update(whenPreviewStarted, new Date().getTime());
    const userSelection = await vscode.window.showInformationMessage(
      'Thanks for previewing Local CI! This free preview will last for 2 days, then it will require a purchased license key.',
      {
        detail: 'Local CI will work for 2 days without a license key',
      },
      getLicense,
      enterLicense
    );

    handleSelection(userSelection, context);
    return;
  }

  if (isPreviewExpired(previewStartedTimeStamp) && !licenseKey) {
    const userSelection = await vscode.window.showWarningMessage(
      'Thanks for previewing Local CI! Please enter a Local CI license key to keep using this.',
      {
        detail: 'Please enter a license key',
      },
      getLicense,
      enterLicense
    );

    handleSelection(userSelection, context);
    return;
  }

  if (!isPreviewExpired(previewStartedTimeStamp)) {
    const timeRemaining = getHoursRemainingInPreview(previewStartedTimeStamp);
    const userSelection = await vscode.window.showWarningMessage(
      getTextForNumber(
        `Thanks for previewing Local CI! There is ${timeRemaining} hour remaining in your free preview.`,
        `Thanks for previewing Local CI! There are ${timeRemaining} hours remaining in your free preview.`,
        timeRemaining
      ),
      {
        detail: 'Please enter a license key',
      },
      getLicense,
      enterLicense
    );

    handleSelection(userSelection, context);
  }
}
