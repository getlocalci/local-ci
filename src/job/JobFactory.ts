import { inject, injectable } from 'inversify';
import Types from 'common/Types';
import EditorGateway from 'common/EditorGateway';
import JobTreeItem from './JobTreeItem';

@injectable()
export default class JobFactory {
  @inject(Types.IEditorGateway)
  editorGateway!: EditorGateway;

  create(label: string, isRunning: boolean, hasChildJob: boolean) {
    return new JobTreeItem(this.editorGateway, label, isRunning, hasChildJob);
  }
}
