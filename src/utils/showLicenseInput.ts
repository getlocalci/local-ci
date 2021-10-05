import * as vscode from 'vscode';
import {
  CACHED_LICENSE_ERROR,
  GET_LICENSE_KEY_URL,
  LICENSE_KEY_STATE,
} from '../constants';
import getLicenseErrorMessage from './getLicenseErrorMessage';
import isLicenseValid from './isLicenseValid';

export default async function showLicenseInput(
  context: vscode.ExtensionContext,
  completedCallback: () => void,
  successCallback: () => void
): Promise<void> {
  const enteredLicenseKey = await vscode.window.showInputBox({
    title: 'Local CI license key',
    prompt: 'Please enter your Local CI license key',
  });
  const enterKeyText = 'Enter license key';
  const enterKeyAgainText = 'Enter license key again';
  const getKeyText = 'Get license key';

  if (enteredLicenseKey === undefined) {
    return; // They pressed Escape or exited the input box.
  }

  const isValid = await isLicenseValid(context, enteredLicenseKey);

  if (isValid) {
    context.secrets.store(LICENSE_KEY_STATE, enteredLicenseKey);
    vscode.window.showInformationMessage(
      'Thank you, your Local CI license key is valid and was activated!'
    );
    completedCallback();
    successCallback();
  } else {
    completedCallback();
    const warningMessage = enteredLicenseKey
      ? `Sorry, there was a problem activating the Local CI license key: ${getLicenseErrorMessage(
          String(await context.secrets.get(CACHED_LICENSE_ERROR))
        )}`
      : 'Please enter a Local CI license key';
    const clicked = await vscode.window.showWarningMessage(
      warningMessage,
      { detail: 'The license key is invalid' },
      enteredLicenseKey ? enterKeyAgainText : enterKeyText,
      getKeyText
    );

    if (clicked === enterKeyText || clicked === enterKeyAgainText) {
      await showLicenseInput(context, completedCallback, successCallback);
      return;
    }

    if (clicked === getKeyText) {
      vscode.env.openExternal(vscode.Uri.parse(GET_LICENSE_KEY_URL));
    }
  }
}
