import * as vscode from 'vscode';
import Job from './classes/Job';
import JobProvider from './classes/JobProvider';
import LicenseProvider from './classes/LicenseProvider';
import {
  COMMITTED_IMAGE_NAMESPACE,
  ENTER_LICENSE_COMMAND,
  EXIT_JOB_COMMAND,
  GET_LICENSE_COMMAND,
  GET_LICENSE_KEY_URL,
  HELP_URL,
  JOB_TREE_VIEW_ID,
  RUN_JOB_COMMAND,
  SELECTED_CONFIG_PATH,
} from './constants';
import getLicenseInformation from './utils/getLicenseInformation';
import disposeTerminalsForJob from './utils/disposeTerminalsForJob';
import runJob from './utils/runJob';
import showLicenseInput from './utils/showLicenseInput';
import cleanUpCommittedImages from './utils/cleanUpCommittedImages';
import getCheckoutJobs from './utils/getCheckoutJobs';
import getAllConfigFilePaths from './utils/getAllConfigFilePaths';
import getConfigFilePath from './utils/getConfigFilePath';
import getDebuggingTerminalName from './utils/getDebuggingTerminalName';
import getFinalTerminalName from './utils/getFinalTerminalName';
import getLocalVolumePath from './utils/getLocalVolumePath';
import getProcessFilePath from './utils/getProcessFilePath';
import getProcessedConfig from './utils/getProcessedConfig';
import writeProcessFile from './utils/writeProcessFile';

export function activate(context: vscode.ExtensionContext): void {
  const jobProvider = new JobProvider(context);

  vscode.window.registerTreeDataProvider(JOB_TREE_VIEW_ID, jobProvider);
  context.subscriptions.push(
    vscode.commands.registerCommand(`${JOB_TREE_VIEW_ID}.refresh`, () =>
      jobProvider.refresh()
    ),
    vscode.commands.registerCommand(`${JOB_TREE_VIEW_ID}.help`, () =>
      vscode.env.openExternal(vscode.Uri.parse(HELP_URL))
    ),
    vscode.commands.registerCommand(`${JOB_TREE_VIEW_ID}.exitAllJobs`, () => {
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
            cleanUpCommittedImages(`${COMMITTED_IMAGE_NAMESPACE}/*`);
          }
        });
    }),
    vscode.commands.registerCommand(
      `${JOB_TREE_VIEW_ID}.selectRepo`,
      async () => {
        const quickPick = vscode.window.createQuickPick();
        const configFilePaths = await getAllConfigFilePaths(context);
        quickPick.title = 'Repo to run CI on';
        quickPick.items = configFilePaths.length
          ? configFilePaths
          : [
              {
                label: 'No config file found',
                description:
                  'Please add a .circleci/config.yml file so Local CI can run',
              },
            ];
        quickPick.onDidChangeSelection((selection) => {
          if (
            selection?.length &&
            (selection[0] as ConfigFileQuickPick)?.fsPath
          ) {
            context.globalState
              .update(
                SELECTED_CONFIG_PATH,
                (selection[0] as ConfigFileQuickPick)?.fsPath
              )
              .then(() => jobProvider.refresh());
          }

          quickPick.dispose();
        });
        quickPick.onDidHide(() => quickPick.dispose());
        quickPick.show();
      }
    )
  );

  vscode.window.createTreeView(JOB_TREE_VIEW_ID, {
    treeDataProvider: jobProvider,
  });
  context.subscriptions.push(
    vscode.commands.registerCommand(
      RUN_JOB_COMMAND,
      (jobName: string, job?: Job) => {
        if (!jobName) {
          vscode.window.showWarningMessage(
            `Please click a specific job to run it`
          );
          vscode.commands.executeCommand(
            'workbench.view.extension.localCiDebugger'
          );

          return;
        }

        if (job instanceof Job) {
          job.setIsRunning();
          jobProvider.refresh(job);
        }

        runJob(context, jobName);
      }
    ),
    vscode.commands.registerCommand(EXIT_JOB_COMMAND, (job: Job) => {
      job.setIsNotRunning();
      const jobName = job.getJobName();
      jobProvider.refresh(job);
      disposeTerminalsForJob(jobName);
    }),
    vscode.commands.registerCommand('local-ci.job.rerun', (job: Job) => {
      job.setIsRunning();
      jobProvider.refresh(job);
      const jobName = job.getJobName();
      disposeTerminalsForJob(jobName);
      runJob(context, jobName);
    }),
    vscode.commands.registerCommand(
      'local-ci.debug.repo',
      (clickedFile: vscode.Uri) => {
        if (clickedFile.fsPath) {
          context.globalState
            .update(SELECTED_CONFIG_PATH, clickedFile.fsPath)
            .then(() => {
              jobProvider.refresh();
              vscode.commands.executeCommand(
                'workbench.view.extension.localCiDebugger'
              );
            });
        }
      }
    ),
    vscode.commands.registerCommand('local-ci.runWalkthroughJob', async () => {
      const configFilePath = await getConfigFilePath(context);
      writeProcessFile(
        await getProcessedConfig(context, configFilePath),
        getProcessFilePath(configFilePath),
        getLocalVolumePath(configFilePath)
      );

      const checkoutJobs = getCheckoutJobs(getProcessFilePath(configFilePath));
      if (!checkoutJobs.length) {
        return;
      }

      const jobName = checkoutJobs[0];
      jobProvider.setRunningJob(jobName);

      vscode.commands.executeCommand(
        'workbench.view.extension.localCiDebugger'
      );
      vscode.commands.executeCommand(RUN_JOB_COMMAND, jobName);
      vscode.window.showInformationMessage(
        `Soon you'll get an interactive bash shell to debug it`
      );
      vscode.window.showInformationMessage(
        `👈 The job ${jobName} is now running`
      );

      vscode.window.onDidOpenTerminal(async (terminal) => {
        if (terminal.name === getDebuggingTerminalName(jobName)) {
          terminal.show();
          vscode.window.showInformationMessage(
            `👈 Here's an interactive bash shell of the job`
          );
        } else if (terminal.name === getFinalTerminalName(jobName)) {
          terminal.show();
          vscode.window.showInformationMessage(
            `👈 Here's another bash shell now that the job exited`
          );
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
