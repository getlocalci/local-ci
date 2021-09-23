import * as vscode from 'vscode';
import { LocalCiProvider } from './LocalCiProvider';
import { RUN_JOB_COMMAND } from './constants';
import licensePrompt from './utils/licensePrompt';
import runJob from './utils/runJob';
import showLicenseInput from './utils/showLicenseInput';

export async function activate(
  context: vscode.ExtensionContext
): Promise<void> {
  const ciProvider = new LocalCiProvider();
  const treeViewId = 'localCi';
  vscode.window.registerTreeDataProvider(treeViewId, ciProvider);
  vscode.commands.registerCommand(`${treeViewId}.refresh`, () =>
    ciProvider.refresh()
  );
  vscode.window.createTreeView(treeViewId, {
    treeDataProvider: ciProvider,
  });
  context.subscriptions.push(
    vscode.commands.registerCommand(RUN_JOB_COMMAND, runJob)
  );

  // Entering this URI in the browser will show the license key input:
  // vscode://local-ci.local-ci/enterLicense
  vscode.window.registerUriHandler({
    handleUri(uri: vscode.Uri) {
      if (uri.path === '/enterLicense') {
        showLicenseInput(context);
      }
    },
  });

  await licensePrompt(context);
}
