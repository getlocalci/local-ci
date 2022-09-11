import 'reflect-metadata';
import type { Container } from 'inversify';
import ChildProcessGateway from 'common/ChildProcessGateway';
import EditorGateway from 'common/EditorGateway';
import FsGateway from 'common/FsGateway';
import HttpGateway from 'common/HttpGateway';
import ProcessGateway from 'common/ProcessGateway';
import BaseIoc from 'common/BaseIoc';
import Types from 'common/Types';

export const container: Container = new BaseIoc().buildBaseTemplate();

container
  .bind(Types.IChildProcessGateway)
  .to(ChildProcessGateway)
  .inSingletonScope();
container.bind(Types.IEditorGateway).to(EditorGateway).inSingletonScope();
container.bind(Types.IFsGateway).to(FsGateway).inSingletonScope();
container.bind(Types.IHttpGateway).to(HttpGateway).inSingletonScope();
container.bind(Types.IProcessGateway).to(ProcessGateway).inSingletonScope();
