import * as vscode from 'vscode';
import isPreviewOver from './isPreviewOver';
import showLicenseInput from './showLicenseInput';
import { LICENSE_KEY_STATE } from '../constants';

const getLicense = 'Get License';
const openNow = 'Now';
const openLater = 'Later';
const whenPreviewStarted = 'localCi:license:whenPreviewStarted';

export default async function licensePrompt(
  context: vscode.ExtensionContext
): Promise<void> {
  const previewStartedTimeStamp = context.globalState.get(whenPreviewStarted);
  const licenseKey = context.globalState.get(LICENSE_KEY_STATE);

  if (!previewStartedTimeStamp && !licenseKey) {
    context.globalState.update(whenPreviewStarted, new Date().getTime());
    return;
  }

  if (isPreviewOver(previewStartedTimeStamp) && !licenseKey) {
    const userSelection = await vscode.window.showWarningMessage(
      'Thanks for previewing Local CI! Please enter a Local CI license key so the extension works',
      {
        detail: 'Please enter a license key',
      },
      getLicense,
      openNow,
      openLater
    );

    if (userSelection === getLicense) {
      vscode.env.openExternal(vscode.Uri.parse('https://getlocalci.com'));
      return;
    }

    if (userSelection === openNow) {
      showLicenseInput(context);
    }
  }
}
