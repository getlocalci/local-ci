import * as vscode from 'vscode';
import Job from './Job';
import JobProvider from './JobProvider';
import LicenseProvider from './LicenseProvider';
import {
  GET_LICENSE_COMMAND,
  GET_LICENSE_KEY_URL,
  HELP_URL,
  ENTER_LICENSE_COMMAND,
  EXIT_JOB_COMMAND,
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
  context.subscriptions.push(
    vscode.commands.registerCommand(`${jobTreeViewId}.refresh`, () =>
      jobProvider.refresh()
    ),
    vscode.commands.registerCommand(`${jobTreeViewId}.help`, () =>
      vscode.env.openExternal(vscode.Uri.parse(HELP_URL))
    ),
    vscode.commands.registerCommand(
      `${jobTreeViewId}.exitAllJobs`,
      async () => {
        const confirmText = 'Yes';
        const selection = await vscode.window.showWarningMessage(
          'Are you sure you want to exit all jobs?',
          { modal: true },
          { title: confirmText }
        );

        if (selection?.title === confirmText) {
          vscode.window.terminals.forEach((terminal) => {
            if (terminal.name.match(/^Local CI/)) {
              terminal.dispose();
            }
          });
        }
      }
    )
  );
  vscode.window.createTreeView(jobTreeViewId, {
    treeDataProvider: jobProvider,
  });
  context.subscriptions.push(
    vscode.commands.registerCommand(
      RUN_JOB_COMMAND,
      async (jobName: string, job: Job) => {
        job.setIsRunning();
        jobProvider.refresh(job);
        job.setRunningTerminals(await runJob(jobName, context.extensionUri));
      }
    ),
    vscode.commands.registerCommand(EXIT_JOB_COMMAND, async (job: Job) => {
      job.setWasExited();
      jobProvider.refresh(job);
      const runningTerminals = job.getRunningTerminals();
      vscode.window.terminals.forEach(async (terminalCandidate) => {
        if (runningTerminals.includes(await terminalCandidate.processId)) {
          terminalCandidate.dispose();
        }
      });

      job.resetRunningTerminals();
      jobProvider.refresh(job);
    })
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
