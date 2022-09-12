import EditorGateway from 'gateway/EditorGateway';
import Types from 'common/Types';
import { inject, injectable } from 'inversify';

@injectable()
export default class CommandFactory {
  @inject(Types.IEditorGateway)
  editorGateway!: EditorGateway;

  create(label: string, command: string) {
    const newCommand = new this.editorGateway.editor.TreeItem(label);

    newCommand.collapsibleState =
      this.editorGateway.editor.TreeItemCollapsibleState.None;
    newCommand.tooltip = label;
    newCommand.command = {
      command,
      title: label,
      tooltip: label,
    };

    return newCommand;
  }
}
