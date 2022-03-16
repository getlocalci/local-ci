import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';
import TelemetryReporter from '@vscode/extension-telemetry';
import { getBinaryPath } from '../node/binary';
import Delayer from './classes/Delayer';
import Job from './classes/Job';
import JobProvider from './classes/JobProvider';
import LicenseProvider from './classes/LicenseProvider';
import {
  COMMITTED_IMAGE_NAMESPACE,
  CREATE_CONFIG_FILE_COMMAND,
  ENTER_LICENSE_COMMAND,
  EXIT_JOB_COMMAND,
  EXTENSION_ID,
  GET_LICENSE_COMMAND,
  GET_LICENSE_KEY_URL,
  HELP_URL,
  HOST_TMP_DIRECTORY,
  JOB_TREE_VIEW_ID,
  PROCESS_TRY_AGAIN_COMMAND,
  RUN_JOB_COMMAND,
  SELECTED_CONFIG_PATH,
  TELEMETRY_KEY,
  TRIAL_STARTED_TIMESTAMP,
} from './constants';
import cleanUpCommittedImages from './utils/cleanUpCommittedImages';
import disposeTerminalsForJob from './utils/disposeTerminalsForJob';
import getAllConfigFilePaths from './utils/getAllConfigFilePaths';
import getCheckoutJobs from './utils/getCheckoutJobs';
import getConfig from './utils/getConfig';
import getConfigFilePath from './utils/getConfigFilePath';
import getDebuggingTerminalName from './utils/getDebuggingTerminalName';
import getDynamicConfigPath from './utils/getDynamicConfigPath';
import getFinalTerminalName from './utils/getFinalTerminalName';
import getRepoBasename from './utils/getRepoBasename';
import getStarterConfig from './utils/getStarterConfig';
import prepareConfig from './utils/prepareConfig';
import runJob from './utils/runJob';
import showLicenseInput from './utils/showLicenseInput';

const reporter = new TelemetryReporter(
  EXTENSION_ID,
  vscode.extensions.getExtension(EXTENSION_ID)?.packageJSON.version,
  TELEMETRY_KEY
);

const doNotConfirmRunJob = 'local-ci.job.do-not-confirm';

export function activate(context: vscode.ExtensionContext): void {
  if (!context.globalState.get(TRIAL_STARTED_TIMESTAMP)) {
    context.globalState.update(TRIAL_STARTED_TIMESTAMP, new Date().getTime());
    reporter.sendTelemetryEvent('firstActivation');

    const getStartedText = 'Get started debugging faster';
    vscode.window
      .showInformationMessage(
        'Thanks for installing Local CI!',
        { detail: 'Getting started with Local CI' },
        getStartedText
      )
      .then((clicked) => {
        if (clicked === getStartedText) {
          vscode.commands.executeCommand(
            'workbench.action.openWalkthrough',
            'LocalCI.local-ci#welcomeLocalCi'
          );
          reporter.sendTelemetryEvent('click.getStarted');
        }
      });
  }

  reporter.sendTelemetryEvent('activate');
  const jobProvider = new JobProvider(context, reporter);
  jobProvider
    .loadJobs()
    .then(() =>
      vscode.window.registerTreeDataProvider(JOB_TREE_VIEW_ID, jobProvider)
    );

  context.subscriptions.push(
    reporter,
    vscode.commands.registerCommand(`${JOB_TREE_VIEW_ID}.refresh`, () =>
      jobProvider.hardRefresh()
    ),
    vscode.commands.registerCommand(PROCESS_TRY_AGAIN_COMMAND, async () => {
      // There might have been a problem with the dynamic config file, so remove it.
      const dynamicConfig = getDynamicConfigPath(
        await getConfigFilePath(context)
      );
      if (fs.existsSync(dynamicConfig)) {
        fs.rmSync(dynamicConfig);
      }

      jobProvider.hardRefresh();
    }),
    vscode.commands.registerCommand(`${JOB_TREE_VIEW_ID}.enterToken`, () => {
      const terminal = vscode.window.createTerminal({
        name: 'Enter CircleCI® API Token',
        message: `Please get a CircleCI® API token: https://circleci.com/account/api This will store the token on your local machine, Local CI won't do anything with that token other than run CircleCI jobs. If you'd rather store the token on your own, please follow these instructions to install the CircleCI CLI: https://circleci.com/docs/2.0/local-cli/ Then, run this Bash command: circleci setup. This token isn't necessary for all jobs, so you might not have to enter a token.`,
        iconPath: vscode.Uri.joinPath(
          context.extensionUri,
          'resources',
          'logo.svg'
        ),
      });
      terminal.show();
      terminal.sendText(`${getBinaryPath()} setup`);
    }),
    vscode.commands.registerCommand(`${JOB_TREE_VIEW_ID}.help`, () => {
      reporter.sendTelemetryEvent('help');
      vscode.env.openExternal(vscode.Uri.parse(HELP_URL));
    }),
    vscode.commands.registerCommand(`${JOB_TREE_VIEW_ID}.exitAllJobs`, () => {
      reporter.sendTelemetryEvent('exitAllJobs');
      jobProvider.hardRefresh();

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
              if (
                terminal.name.startsWith('Local CI') &&
                !terminal.exitStatus
              ) {
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
        reporter.sendTelemetryEvent('selectRepo');

        const createConfigText = 'Create a config for me';
        const quickPick = vscode.window.createQuickPick();
        const configFilePaths = await getAllConfigFilePaths(context);
        quickPick.title = 'Repo to run CI on';
        quickPick.items = configFilePaths.length
          ? configFilePaths
          : [
              {
                label: 'No config file found',
                description:
                  'A .circleci/config.yml file is needed to run Local CI',
              },
              {
                label: createConfigText,
              },
            ];
        quickPick.onDidChangeSelection((selection) => {
          if (selection.length && selection[0].label === createConfigText) {
            vscode.commands.executeCommand(CREATE_CONFIG_FILE_COMMAND);
          }
          if (
            selection?.length &&
            (selection[0] as ConfigFileQuickPick)?.fsPath
          ) {
            const selectedFsPath = (selection[0] as ConfigFileQuickPick)
              ?.fsPath;
            context.globalState
              .update(SELECTED_CONFIG_PATH, selectedFsPath)
              .then(() => {
                jobProvider.hardRefresh();
                vscode.window.showInformationMessage(
                  `The repo ${getRepoBasename(selectedFsPath)} is now selected`
                );
              });
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
      async (jobName: string, job?: Job) => {
        if (!jobName) {
          vscode.window.showWarningMessage(
            `Please click a specific job to run it`
          );
          vscode.commands.executeCommand(
            'workbench.view.extension.localCiDebugger'
          );

          return;
        }

        reporter.sendTelemetryEvent('runJob');

        if (job instanceof Job) {
          job.setIsRunning();
          await jobProvider.hardRefresh(job);
        }

        if (context.globalState.get(doNotConfirmRunJob)) {
          runJob(context, jobName, jobProvider, job);
        }

        const confirmText = 'Yes';
        const doNotAskAgainText = `Don't ask again`;
        vscode.window
          .showInformationMessage(
            `Do you want to run the job ${jobName}?`,
            { modal: true },
            { title: confirmText },
            { title: doNotAskAgainText }
          )
          .then((selection) => {
            if (
              selection?.title === confirmText ||
              selection?.title === doNotAskAgainText
            ) {
              runJob(context, jobName, jobProvider, job);
            }

            if (selection?.title === doNotAskAgainText) {
              context.globalState.update(doNotConfirmRunJob, true);
            }
          });
      }
    ),
    vscode.commands.registerCommand(EXIT_JOB_COMMAND, (job: Job) => {
      job.setIsNotRunning();
      const jobName = job.getJobName();
      jobProvider.refresh(job);
      disposeTerminalsForJob(jobName);
    }),
    vscode.commands.registerCommand('local-ci.job.rerun', async (job: Job) => {
      const jobName = job.getJobName();
      const confirmText = 'Yes';
      const doNotAskAgainText = `Don't ask again`;

      vscode.window
        .showInformationMessage(
          `Do you want to rerun the job ${jobName}?`,
          { modal: true },
          { title: confirmText },
          { title: doNotAskAgainText }
        )
        .then(async (selection) => {
          if (
            selection?.title === confirmText ||
            selection?.title === doNotAskAgainText
          ) {
            job.setIsRunning();
            await jobProvider.hardRefresh(job);
            disposeTerminalsForJob(jobName);

            reporter.sendTelemetryEvent('rerunJob');
            runJob(context, jobName, jobProvider, job);
          }

          if (selection?.title === doNotAskAgainText) {
            context.globalState.update(doNotConfirmRunJob, true);
          }
        });
    }),
    vscode.commands.registerCommand(
      'local-ci.debug.repo',
      (clickedFile: vscode.Uri) => {
        reporter.sendTelemetryEvent('click.debugRepo');
        if (clickedFile.fsPath) {
          context.globalState
            .update(SELECTED_CONFIG_PATH, clickedFile.fsPath)
            .then(() => {
              jobProvider.hardRefresh();
              vscode.commands.executeCommand(
                'workbench.view.extension.localCiDebugger'
              );
            });
        }
      }
    ),
    vscode.commands.registerCommand('local-ci.runWalkthroughJob', async () => {
      reporter.sendTelemetryEvent('runWalkthroughJob');
      const configFilePath = await getConfigFilePath(context);
      const { processedConfig } = prepareConfig(configFilePath, reporter);

      const checkoutJobs = getCheckoutJobs(getConfig(processedConfig));
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
        `👈 The job ${jobName} is now running in your local`
      );

      vscode.window.onDidOpenTerminal(async (terminal) => {
        if (terminal.name === getDebuggingTerminalName(jobName)) {
          terminal.show();
          vscode.window.showInformationMessage(
            `👈 Here's an interactive bash shell of the job. Enter something, like whoami`
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

  // When saving .circlci/config.yml, this refreshes the jobs tree.
  const delayer = new Delayer(2000);
  vscode.workspace.onDidSaveTextDocument(
    async (textDocument: vscode.TextDocument): Promise<void> => {
      if (
        textDocument.uri.fsPath.endsWith('.circleci/config.yml') &&
        textDocument.uri.fsPath === (await getConfigFilePath(context))
      ) {
        delayer.trigger(() => jobProvider.hardRefresh(undefined, true));
      }
    }
  );

  const licenseCompletedCallback = () => licenseProvider.load();
  const licenseSuccessCallback = () => jobProvider.hardRefresh();
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
        licenseCompletedCallback,
        licenseSuccessCallback
      );
    }),
    vscode.commands.registerCommand(CREATE_CONFIG_FILE_COMMAND, async () => {
      reporter.sendTelemetryEvent('createConfigFile');
      const folderUri = vscode.workspace.workspaceFolders?.length
        ? vscode.workspace.workspaceFolders[0].uri
        : null;

      if (!folderUri) {
        return;
      }

      const configUri = folderUri.with({
        path: path.posix.join(folderUri.path, '.circleci', 'config.yml'),
      });
      await vscode.workspace.fs.writeFile(
        configUri,
        Buffer.from(getStarterConfig(), 'utf8')
      );
      vscode.window.showTextDocument(configUri);

      vscode.window.showInformationMessage(
        `👆 Here's a starter config file that you can edit`,
        { detail: 'Starter config file' }
      );
      jobProvider.hardRefresh();
    })
  );

  // Entering this URI in the browser will show the license key input:
  // vscode://LocalCI.local-ci/enterLicense
  vscode.window.registerUriHandler({
    handleUri: (uri: vscode.Uri) => {
      if (uri.path === '/enterLicense') {
        showLicenseInput(
          context,
          licenseCompletedCallback,
          licenseSuccessCallback
        );
      }
    },
  });
}

export function deactivate(): void {
  reporter.sendTelemetryEvent('deactivate');
  fs.rmSync(HOST_TMP_DIRECTORY, { recursive: true, force: true });
}
