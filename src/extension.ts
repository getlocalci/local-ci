import { container as iocContainer } from 'common/AppIoc';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import TelemetryReporter from '@vscode/extension-telemetry';
import Delayer from 'job/Delayer';
import JobFactory from 'job/JobFactory';
import JobProviderFactory from 'job/JobProviderFactory';
import LicenseProviderFactory from 'license/LicenseProviderFactory';
import LogProvider from 'log/LogProvider';
import {
  CREATE_CONFIG_FILE_COMMAND,
  DO_NOT_CONFIRM_RUN_JOB,
  ENTER_LICENSE_COMMAND,
  EXIT_JOB_COMMAND,
  EXTENSION_ID,
  GET_LICENSE_COMMAND,
  GET_LICENSE_KEY_URL,
  HELP_URL,
  HOST_TMP_DIRECTORY,
  JOB_TREE_VIEW_ID,
  LOG_FILE_SCHEME,
  RUN_JOB_COMMAND,
  SELECTED_CONFIG_PATH,
  SHOW_LOG_FILE_COMMAND,
  TELEMETRY_KEY,
  TRIAL_STARTED_TIMESTAMP,
} from 'constants/';
import cleanUpCommittedImages from 'containerization/CommittedImages';
import disposeTerminalsForJob from 'terminal/JobTerminals';
import AllConfigFiles from 'config/AllConfigFiles';
import getCheckoutJobs from 'job/getCheckoutJobs';
import getConfig from 'config/getConfig';
import getConfigFilePath from 'config/ConfigFile';
import getDebuggingTerminalName from 'terminal/getDebuggingTerminalName';
import getDynamicConfigPath from 'config/getDynamicConfigPath';
import getFinalTerminalName from 'terminal/getFinalTerminalName';
import getRepoBasename from 'common/getRepoBasename';
import getStarterConfig from 'config/getStarterConfig';
import prepareConfig from 'config/Config';
import runJob from 'job/JobRunner';
import showLicenseInput from 'license/LicenseInput';
import showLogFile from 'log/LogFile';
import askForEmail from 'license/Email';
import RegistrarFactory from 'common/RegistrarFactory';

const reporter = new TelemetryReporter(
  EXTENSION_ID,
  vscode.extensions.getExtension(EXTENSION_ID)?.packageJSON.version,
  TELEMETRY_KEY
);

export function activate(context: vscode.ExtensionContext): void {
  if (!context.globalState.get(TRIAL_STARTED_TIMESTAMP)) {
    context.globalState.update(TRIAL_STARTED_TIMESTAMP, new Date().getTime());
    reporter.sendTelemetryEvent('firstActivation');
    askForEmail(reporter);

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
            `${EXTENSION_ID}#welcomeLocalCi`
          );
          reporter.sendTelemetryEvent('click.getStarted');
        }
      });
  }

  const jobFactory: JobFactory = iocContainer.get(JobFactory);
  reporter.sendTelemetryEvent('activate');
  const jobProvider = iocContainer
    .get(JobProviderFactory)
    .create(context, reporter);
  jobProvider
    .init()
    .then(() =>
      vscode.window.registerTreeDataProvider(JOB_TREE_VIEW_ID, jobProvider)
    );

  context.subscriptions.push(
    reporter,
    vscode.workspace.registerTextDocumentContentProvider(
      LOG_FILE_SCHEME,
      iocContainer.get(LogProvider)
    )
  );

  context.subscriptions.push(
    vscode.window.createTreeView(JOB_TREE_VIEW_ID, {
      treeDataProvider: jobProvider,
    }),
    vscode.commands.registerCommand(
      'local-ci.job.rerun',
      async (job: JobFactory) => {
        const jobName = job.getJobName();
        const confirmText = 'Yes';
        const dontAskAgainText = `Yes, don't ask again`;

        async function rerunJob() {
          reporter.sendTelemetryEvent('rerunJob');
          disposeTerminalsForJob(jobName);
          runJob(context, jobName, jobProvider, job);
        }

        if (context.globalState.get(DO_NOT_CONFIRM_RUN_JOB)) {
          rerunJob();
          return;
        }

        vscode.window
          .showInformationMessage(
            `Do you want to rerun the job ${jobName}?`,
            { modal: true },
            { title: confirmText },
            { title: dontAskAgainText }
          )
          .then(async (selection) => {
            if (
              selection?.title === confirmText ||
              selection?.title === dontAskAgainText
            ) {
              rerunJob();
            }

            if (selection?.title === dontAskAgainText) {
              context.globalState.update(DO_NOT_CONFIRM_RUN_JOB, true);
            }
          });
      }
    ),
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
  const licenseProvider = iocContainer
    .get(LicenseProviderFactory)
    .create(context, licenseSuccessCallback);
  const registrar = iocContainer
    .get(RegistrarFactory)
    .create(context, jobProvider, licenseProvider);
  vscode.window.registerWebviewViewProvider(licenseTreeViewId, licenseProvider);

  context.subscriptions.push(
    ...registrar.registerCommands(),
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
    }),
    vscode.commands.registerCommand(SHOW_LOG_FILE_COMMAND, (logFilePath) => {
      showLogFile(logFilePath);
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
