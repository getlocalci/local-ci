import * as vscode from 'vscode';
import { LICENSE_KEY_STATE } from '../constants';
import isLicenseValid from './isLicenseValid';

export default async function showLicenseInput(
  context: vscode.ExtensionContext
): Promise<void> {
  const enteredLicenseKey = await vscode.window.showInputBox({
    title: 'Local CI license key',
    prompt: 'Please enter your license key',
  });

  if (isLicenseValid(enteredLicenseKey)) {
    await context.globalState.update(LICENSE_KEY_STATE, enteredLicenseKey);
    await vscode.window.showInformationMessage(
      'Thank you, your Local CI license key is activated!'
    );
  }
}
