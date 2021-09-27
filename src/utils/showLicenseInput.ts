import * as vscode from 'vscode';
import { GET_LICENSE_KEY_URL, LICENSE_KEY_STATE } from '../constants';
import isLicenseValid from './isLicenseValid';

export default async function showLicenseInput(
  context: vscode.ExtensionContext
): Promise<void> {
  const enteredLicenseKey = await vscode.window.showInputBox({
    title: 'Local CI license key',
    prompt: 'Please enter your Local CI license key',
  });
  const enterKeyText = 'Enter license key';
  const enterKeyAgainText = 'Enter license key again';
  const getKeyText = 'Get license key';

  if (isLicenseValid(enteredLicenseKey)) {
    await context.globalState.update(LICENSE_KEY_STATE, enteredLicenseKey);
    await vscode.window.showInformationMessage(
      'Thank you, your Local CI license key is valid and was activated!'
    );
  } else {
    const warningMessage = enteredLicenseKey
      ? 'Sorry, there was a problem activating the Local CI license key.'
      : 'Please enter a Local CI license key';
    const clicked = await vscode.window.showWarningMessage(
      warningMessage,
      { detail: 'The license key is invalid' },
      enteredLicenseKey ? enterKeyAgainText : enterKeyText,
      getKeyText
    );

    if (clicked === enterKeyText || clicked === enterKeyAgainText) {
      await showLicenseInput(context);
      return;
    }

    if (clicked === getKeyText) {
      vscode.env.openExternal(vscode.Uri.parse(GET_LICENSE_KEY_URL));
    }
  }
}
