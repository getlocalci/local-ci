import 'reflect-metadata';
import { Container } from 'inversify';
import ChildProcessGateway from 'gateway/ChildProcessGateway';
import EditorGateway from 'gateway/EditorGateway';
import FsGateway from 'gateway/FsGateway';
import HttpGateway from 'gateway/HttpGateway';
import ProcessGateway from 'gateway/ProcessGateway';
import BaseIoc from 'common/BaseIoc';
import Types from 'common/Types';
import ReporterGateway from 'gateway/ReporterGateway';
import OsGateway from 'gateway/OsGateway';

export const iocContainer: Container = new BaseIoc().buildBaseTemplate();

iocContainer
  .bind(Types.IChildProcessGateway)
  .to(ChildProcessGateway)
  .inSingletonScope();
iocContainer.bind(Types.IEditorGateway).to(EditorGateway).inSingletonScope();
iocContainer.bind(Types.IFsGateway).to(FsGateway).inSingletonScope();
iocContainer.bind(Types.IHttpGateway).to(HttpGateway).inSingletonScope();
iocContainer.bind(Types.IOsGateway).to(OsGateway).inSingletonScope();
iocContainer.bind(Types.IProcessGateway).to(ProcessGateway).inSingletonScope();
iocContainer
  .bind(Types.IReporterGateway)
  .to(ReporterGateway)
  .inSingletonScope();
