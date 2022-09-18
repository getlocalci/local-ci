import 'reflect-metadata';
import BaseIoc from 'common/BaseIoc';
import LoggingChildProcessGateway from 'gateway/LoggingChildProcessGateway';
import EditorGateway from 'gateway/EditorGateway';
import FsGateway from 'gateway/FsGateway';
import HttpGateway from 'gateway/HttpGateway';
import OsGateway from 'gateway/OsGateway';
import ProcessGateway from 'gateway/ProcessGateway';
import ReporterGateway from 'gateway/ReporterGateway';
import Types from 'common/Types';

export const iocContainer = new BaseIoc().buildBaseTemplate();

iocContainer
  .bind(Types.IChildProcessGateway)
  .to(LoggingChildProcessGateway)
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
