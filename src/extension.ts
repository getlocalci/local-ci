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
import disposeTerminalsForJob from './utils/disposeTerminalsForJob';
import runJob from './utils/runJob';
import showLicenseInput from './utils/showLicenseInput';

const runningTerminals: RunningTerminals = {};

export function activate(context: vscode.ExtensionContext): void {
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
    vscode.commands.registerCommand(`${jobTreeViewId}.exitAllJobs`, () => {
      const confirmText = 'Yes';
      vscode.window
        .showWarningMessage(
          'Are you sure you want to exit all jobs?',
          { modal: true },
          { title: confirmText }
        )
        .then((selection) => {
          if (selection?.title === confirmText) {
            const flattenedTerminals = Object.values(runningTerminals).reduce(
              (accumulator, terminals) => [...accumulator, ...terminals],
              []
            );

            vscode.window.terminals.forEach((terminal) => {
              terminal.processId.then((id) => {
                if (flattenedTerminals.includes(id)) {
                  terminal.dispose();
                }
              });
            });
          }
        });
    })
  );

  vscode.window.createTreeView(jobTreeViewId, {
    treeDataProvider: jobProvider,
  });
  context.subscriptions.push(
    vscode.commands.registerCommand(
      RUN_JOB_COMMAND,
      (jobName: string, job: Job) => {
        job.setIsRunning();
        jobProvider.refresh(job);

        runJob(jobName, context.extensionUri).then(
          (terminalsForJob: RunningTerminal[]) => {
            runningTerminals[jobName] = terminalsForJob;
          }
        );
      }
    ),
    vscode.commands.registerCommand(EXIT_JOB_COMMAND, (job: Job) => {
      job.setWasExited();
      const jobName = job.getJobName();
      jobProvider.refresh(job);

      disposeTerminalsForJob(runningTerminals, jobName).then(() => {
        delete runningTerminals[jobName];
      });
    }),
    vscode.commands.registerCommand('localCi.job.rerun', (job: Job) => {
      job.setIsRunning();
      jobProvider.refresh(job);
      const jobName = job.getJobName();
      disposeTerminalsForJob(runningTerminals, jobName).then(() => {
        runJob(jobName, context.extensionUri).then(
          (terminalsForJob: RunningTerminal[]) => {
            runningTerminals[jobName] = terminalsForJob;
          }
        );
      });
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
    vscode.commands.registerCommand(ENTER_LICENSE_COMMAND, () => {
      showLicenseInput(context);
    })
  );

  // Entering this URI in the browser will show the license key input:
  // vscode://local-ci.local-ci/enterLicense
  vscode.window.registerUriHandler({
    handleUri: (uri: vscode.Uri) => {
      if (uri.path === '/enterLicense') {
        showLicenseInput(context);
      }
    },
  });

  getLicenseInformation(context);
}
