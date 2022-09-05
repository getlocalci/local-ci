import ChildProcessGateway from 'common/ChildProcessGateway';
import EditorGateway from './common/EditorGateway';
import FsGateway from './common/FsGateway';
import Types from './common/types';
import BaseIoc from './BaseIoc';

export const container = new BaseIoc().buildBaseTemplate();

container
  .bind(Types.IChildProcessGateway)
  .to(ChildProcessGateway)
  .inSingletonScope();
container.bind(Types.IEditorGateway).to(EditorGateway).inSingletonScope();
container.bind(Types.IFsGateway).to(FsGateway).inSingletonScope();
