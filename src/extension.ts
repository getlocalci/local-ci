import * as vscode from 'vscode';
import Job from './classes/Job';
import JobProvider from './classes/JobProvider';
import LicenseProvider from './classes/LicenseProvider';
import {
  ENTER_LICENSE_COMMAND,
  EXIT_JOB_COMMAND,
  GET_LICENSE_COMMAND,
  GET_LICENSE_KEY_URL,
  HELP_URL,
  PROCESS_FILE_PATH,
  RUN_JOB_COMMAND,
} from './constants';
import getLicenseInformation from './utils/getLicenseInformation';
import disposeTerminalsForJob from './utils/disposeTerminalsForJob';
import runJob from './utils/runJob';
import showLicenseInput from './utils/showLicenseInput';
import cleanUpCommittedImage from './utils/cleanUpCommittedImage';
import getCheckoutJobs from './utils/getCheckoutJobs';

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
      jobProvider.refresh();

      const confirmText = 'Yes';
      vscode.window
        .showWarningMessage(
          'Are you sure you want to exit all jobs?',
          { modal: true },
          { title: confirmText }
        )
        .then((selection) => {
          if (selection?.title === confirmText) {
            vscode.window.terminals.forEach((terminal) => {
              if (terminal.name.startsWith('Local CI')) {
                terminal.dispose();
              }
            });
            cleanUpCommittedImage('local-ci');
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
      job.setIsNotRunning();
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
    }),
    vscode.commands.registerCommand('local-ci.runWalkthroughJob', () => {
      const checkoutJobs = getCheckoutJobs(PROCESS_FILE_PATH);
      if (!checkoutJobs.length) {
        return;
      }

      const jobName = checkoutJobs[0];
      vscode.commands.executeCommand(
        RUN_JOB_COMMAND,
        jobName,
        jobProvider.getJob(jobName)
      );
    }),
    vscode.commands.registerCommand('local-ci.debugWalkthroughJob', () => {
      const checkoutJobs = getCheckoutJobs(PROCESS_FILE_PATH);
      if (!checkoutJobs.length) {
        return;
      }

      const jobName = checkoutJobs[0];
      if (!runningTerminals[jobName]?.length) {
        return;
      }

      vscode.window.terminals.forEach(async (terminal) => {
        if ((await terminal.processId) === runningTerminals[jobName][1]) {
          terminal.show();
        }
      });
    })
  );

  const licenseSuccessCallback = () => jobProvider.refresh();
  const licenseTreeViewId = 'localCiLicense';
  const licenseProvider = new LicenseProvider(context, licenseSuccessCallback);
  vscode.window.registerWebviewViewProvider(licenseTreeViewId, licenseProvider);

  context.subscriptions.push(
    vscode.commands.registerCommand(`${licenseTreeViewId}.refresh`, () => {
      licenseProvider.load();
    }),
    vscode.commands.registerCommand(GET_LICENSE_COMMAND, () => {
      vscode.env.openExternal(vscode.Uri.parse(GET_LICENSE_KEY_URL));
    }),
    vscode.commands.registerCommand(ENTER_LICENSE_COMMAND, () => {
      showLicenseInput(
        context,
        () => licenseProvider.load(),
        licenseSuccessCallback
      );
    })
  );

  // Entering this URI in the browser will show the license key input:
  // vscode://LocalCI.local-ci/enterLicense
  vscode.window.registerUriHandler({
    handleUri: (uri: vscode.Uri) => {
      if (uri.path === '/enterLicense') {
        showLicenseInput(
          context,
          () => licenseProvider.load(),
          licenseSuccessCallback
        );
      }
    },
  });

  getLicenseInformation(context);
}
