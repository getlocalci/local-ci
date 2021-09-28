import * as vscode from 'vscode';
import JobProvider from './JobProvider';
import LicenseProvider from './LicenseProvider';
import {
  GET_LICENSE_COMMAND,
  GET_LICENSE_KEY_URL,
  ENTER_LICENSE_COMMAND,
  RUN_JOB_COMMAND,
} from './constants';
import getLicenseInformation from './utils/getLicenseInformation';
import runJob from './utils/runJob';
import showLicenseInput from './utils/showLicenseInput';

export async function activate(
  context: vscode.ExtensionContext
): Promise<void> {
  const jobTreeViewId = 'localCiJobs';
  const jobProvider = new JobProvider(context);
  vscode.window.registerTreeDataProvider(jobTreeViewId, jobProvider);
  vscode.commands.registerCommand(`${jobTreeViewId}.refresh`, () =>
    jobProvider.refresh()
  );
  vscode.window.createTreeView(jobTreeViewId, {
    treeDataProvider: jobProvider,
  });
  context.subscriptions.push(
    vscode.commands.registerCommand(RUN_JOB_COMMAND, runJob)
  );

  const licenseTreeViewId = 'localCiLicense';
  const licenseProvider = new LicenseProvider(context);
  vscode.window.registerWebviewViewProvider(licenseTreeViewId, licenseProvider);

  context.subscriptions.push(
    vscode.commands.registerCommand(GET_LICENSE_COMMAND, () => {
      vscode.env.openExternal(vscode.Uri.parse(GET_LICENSE_KEY_URL));
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(ENTER_LICENSE_COMMAND, async () => {
      await showLicenseInput(context);
    })
  );

  // Entering this URI in the browser will show the license key input:
  // vscode://local-ci.local-ci/enterLicense
  vscode.window.registerUriHandler({
    handleUri: async (uri: vscode.Uri) => {
      if (uri.path === '/enterLicense') {
        await showLicenseInput(context);
      }
    },
  });

  await getLicenseInformation(context);
}
