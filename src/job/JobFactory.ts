import EditorGateway from 'gateway/EditorGateway';
import JobTreeItem from './JobTreeItem';

export default class JobFactory {
  constructor(public editorGateway: EditorGateway) {}

  create(label: string, isRunning: boolean, hasChildJob: boolean) {
    return new JobTreeItem(this.editorGateway, label, isRunning, hasChildJob);
  }
}
