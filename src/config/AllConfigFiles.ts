import { inject, injectable } from 'inversify';
import * as vscode from 'vscode';
import { SELECTED_CONFIG_PATH } from 'constants/';
import getRepoBasename from 'common/getRepoBasename';
import EditorGateway from 'common/EditorGateway';
import Types from 'common/Types';

@injectable()
export default class AllConfigFiles {
  @inject(Types.IEditorGateway)
  editorGateway!: EditorGateway;

  /**
   * Gets all of the paths to .circleci/config.yml files
   *
   * A workspace might have multiple .circleci/config.yml files.
   */
  async getPaths(
    context: vscode.ExtensionContext
  ): Promise<ConfigFileQuickPick[]> {
    const configFiles = await this.editorGateway.editor.workspace.findFiles(
      '**/.circleci/config.yml',
      '**/{node_modules,vendor}/**'
    );

    const selectedConfigPath = context.globalState.get(SELECTED_CONFIG_PATH);
    return configFiles
      .sort((first, second) => {
        if (!selectedConfigPath) {
          return 0;
        }

        if (first.fsPath === selectedConfigPath) {
          return -1;
        }

        if (second.fsPath === selectedConfigPath) {
          return 1;
        }

        return 0;
      })
      .map((configFile) => ({
        label: getRepoBasename(configFile.fsPath),
        description: this.editorGateway.editor.workspace.asRelativePath(
          configFile.fsPath
        ),
        fsPath: configFile.fsPath,
      }));
  }
}
