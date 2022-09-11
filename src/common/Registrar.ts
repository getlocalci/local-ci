import EditorGateway from 'common/EditorGateway';
import Types from 'common/Types';
import { inject, injectable } from 'inversify';
import JobProvider from 'job/JobProvider';
import * as vscode from 'vscode';
import Refresh from '../command/Refresh';
import TryProcessAgain from '../command/TryProcessAgain';

@injectable()
export default class Registrar {
  constructor(
    private context: vscode.ExtensionContext,
    private jobProvider: JobProvider,
    @inject(Types.IEditorGateway) private editorGateway: EditorGateway,
    @inject(Refresh) private refresh: Refresh,
    @inject(TryProcessAgain) private tryProcessAgain: TryProcessAgain
  ) {}

  registerCommands(): vscode.Disposable[] {
    return [this.refresh, this.tryProcessAgain].map((command) => {
      return this.editorGateway.editor.commands.registerCommand(
        command.commandName,
        command.getCallback(this.context, this.jobProvider)
      );
    });
  }
}
