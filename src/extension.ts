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
  LICENSE_TREE_VIEW_ID,
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

  reporter.sendTelemetryEvent('activate');
  const jobProvider = iocContainer
    .get(JobProviderFactory)
    .create(context, reporter);
  jobProvider.init();

  context.subscriptions.push(reporter);

  // When saving .circlci/config.yml, this refreshes the jobs tree.
  const licenseCompletedCallback = () => licenseProvider.load();
  const licenseSuccessCallback = () => jobProvider.hardRefresh();
  const licenseProvider = iocContainer
    .get(LicenseProviderFactory)
    .create(context, licenseSuccessCallback);
  const registrar = iocContainer
    .get(RegistrarFactory)
    .create(context, jobProvider, licenseProvider);

  context.subscriptions.push(
    ...registrar.registerCommands(),
    ...registrar.registerProviders(),
    vscode.commands.registerCommand(`${LICENSE_TREE_VIEW_ID}.refresh`, () => {
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

  registrar.registerHandlers();
}

export function deactivate(): void {
  reporter.sendTelemetryEvent('deactivate');
  fs.rmSync(HOST_TMP_DIRECTORY, { recursive: true, force: true });
}
