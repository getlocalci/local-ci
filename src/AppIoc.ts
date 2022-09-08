import 'reflect-metadata';
import ChildProcessGateway from 'common/ChildProcessGateway';
import EditorGateway from './common/EditorGateway';
import FsGateway from './common/FsGateway';
import BaseIoc from './BaseIoc';
import Types from 'common/Types';

export const container: IocContainer = new BaseIoc().buildBaseTemplate();

container
  .bind(Types.IChildProcessGateway)
  .to(ChildProcessGateway)
  .inSingletonScope();
container.bind(Types.IEditorGateway).to(EditorGateway).inSingletonScope();
container.bind(Types.IFsGateway).to(FsGateway).inSingletonScope();
