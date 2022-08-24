import * as cp from 'child_process';
import * as vscode from 'vscode';
import getSpawnOptions from './getSpawnOptions';

/**
 * Shows a warning the configuration is wrong.
 */
export default function validateSettings(): void {
  if (
    'doppler' !==
    vscode.workspace
      .getConfiguration('localCi')
      .get('environmentVariable.manager')
  ) {
    return;
  }

  try {
    cp.execSync('doppler --version', {
      ...getSpawnOptions(),
      timeout: 2000,
    });
  } catch (error) {
    vscode.window.showErrorMessage(
      `doppler is not installed on your machine, but it's enabled in settings.json via the property localCi.environmentVariable.manager.
      Please either install it, or remove that value from settings.json.`,
      { detail: 'Settings error' }
    );
  }
}
