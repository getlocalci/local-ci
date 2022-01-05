import * as vscode from 'vscode';
import { CREATE_CONFIG_FILE_COMMAND, SELECTED_CONFIG_PATH } from '../constants';
import getAllConfigFilePaths from './getAllConfigFilePaths';

// Gets the path of the selected .circleci/config.yml to run the jobs on.
export default async function getConfigFilePath(
  context: vscode.ExtensionContext
): Promise<string> {
  const selectedConfigPath = String(
    context.globalState.get(SELECTED_CONFIG_PATH)
  );
  const isConfigInWorkspace =
    !!selectedConfigPath &&
    !!vscode.workspace.getWorkspaceFolder(vscode.Uri.file(selectedConfigPath));

  if (isConfigInWorkspace) {
    return Promise.resolve(selectedConfigPath);
  }

  const allConfigFilePaths = await getAllConfigFilePaths(context);
  if (!allConfigFilePaths.length) {
    const createConfigText = 'Create a config for me';
    vscode.window
      .showInformationMessage(
        `Let's get you started with a .circleci/config.yml file so you can use Local CI`,
        { detail: 'There is no config file for Local CI to run' },
        createConfigText
      )
      .then((clicked) => {
        if (clicked === createConfigText) {
          vscode.commands.executeCommand(CREATE_CONFIG_FILE_COMMAND);
        }
      });

    return '';
  }

  if (allConfigFilePaths.length === 1) {
    return allConfigFilePaths[0].fsPath;
  }

  const chooseRepoText = 'Choose repo';
  vscode.window
    .showInformationMessage(
      'Please select the repo to run Local CI on',
      { detail: 'There is no repo selected to run Local CI on' },
      chooseRepoText
    )
    .then((clicked) => {
      if (clicked === chooseRepoText) {
        vscode.commands.executeCommand('localCiJobs.selectRepo');
      }
    });

  return '';
}
