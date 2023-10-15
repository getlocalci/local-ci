import EditorGateway from 'gateway/EditorGateway';
import CommandTreeItem from './CommandTreeItem';

export default class CommandFactory {
  constructor(public editorGateway: EditorGateway) {}

  create(label: string, command: string) {
    return new CommandTreeItem(this.editorGateway, label, command);
  }
}
