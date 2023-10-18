import type vscode from 'vscode';
import AllConfigFiles from './AllConfigFiles';
import EditorGateway from 'gateway/EditorGateway';
import ReporterGateway from 'gateway/ReporterGateway';
import {
  CREATE_CONFIG_FILE_COMMAND,
  SELECTED_CONFIG_PATH,
  SELECT_REPO_COMMAND,
} from 'constant';

export default class ConfigFile {
  constructor(
    public allConfigFiles: AllConfigFiles,
    public editorGateway: EditorGateway,
    public reporterGateway: ReporterGateway
  ) {}

  /**
   * Gets the absolute path of the selected .circleci/config.yml to run the jobs on.
   *
   * Or '' if none is found.
   */
  async getPath(context: vscode.ExtensionContext): Promise<string | ''> {
    const selectedConfigPath = String(
      context.globalState.get(SELECTED_CONFIG_PATH)
    );
    const isConfigInWorkspace =
      !!selectedConfigPath &&
      !!this.editorGateway.editor.workspace.getWorkspaceFolder(
        this.editorGateway.editor.Uri.file(selectedConfigPath)
      );

    if (isConfigInWorkspace) {
      return Promise.resolve(selectedConfigPath);
    }

    if (!this.editorGateway.editor.workspace.workspaceFolders?.length) {
      this.reporterGateway.reporter.sendTelemetryErrorEvent('noFolderOpen');

      const openFolderText = 'Open folder';
      this.editorGateway.editor.window
        .showInformationMessage(
          'Please open a folder so you can run Local CI',
          { detail: 'There is no folder selected' },
          openFolderText
        )
        .then((clicked) => {
          if (clicked === openFolderText) {
            this.reporterGateway.reporter.sendTelemetryEvent('openFolder');
            this.editorGateway.editor.commands.executeCommand(
              'workbench.action.files.openFileFolder'
            );
          }
        });

      return '';
    }

    const allConfigFilePaths = await this.allConfigFiles.getPaths(context);
    if (!allConfigFilePaths.length) {
      const createConfigText = 'Create a config for me';
      this.editorGateway.editor.window
        .showInformationMessage(
          `Let's get you started with a .circleci/config.yml file so you can use Local CI`,
          { detail: 'There is no config file for Local CI to run' },
          createConfigText
        )
        .then((clicked) => {
          if (clicked === createConfigText) {
            this.editorGateway.editor.commands.executeCommand(
              CREATE_CONFIG_FILE_COMMAND
            );
          }
        });

      return '';
    }

    if (allConfigFilePaths.length === 1) {
      return allConfigFilePaths[0].fsPath;
    }

    const selectRepoText = 'Select repo';
    this.editorGateway.editor.window
      .showInformationMessage(
        'Please select the repo to run Local CI on',
        { detail: 'There is no repo selected to run Local CI on' },
        selectRepoText
      )
      .then((clicked) => {
        if (clicked === selectRepoText) {
          this.editorGateway.editor.commands.executeCommand(
            SELECT_REPO_COMMAND
          );
        }
      });

    return '';
  }
}
