import { inject, injectable } from 'inversify';
import EditorGateway from 'gateway/EditorGateway';
import Types from 'common/Types';
import CommandTreeItem from './CommandTreeItem';

@injectable()
export default class CommandFactory {
  @inject(Types.IEditorGateway)
  editorGateway!: EditorGateway;

  create(label: string, command: string) {
    return new CommandTreeItem(this.editorGateway, label, command);
  }
}
