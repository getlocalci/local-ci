import 'reflect-metadata';
import BaseIoc from 'common/BaseIoc';
import Cache from 'common/Cache';
import ChildProcessGateway from 'gateway/ChildProcessGateway';
import EditorGateway from 'gateway/EditorGateway';
import EnvVar from 'process/EnvVar';
import FsGateway from 'gateway/FsGateway';
import HttpGateway from 'gateway/HttpGateway';
import OsGateway from 'gateway/OsGateway';
import ProcessGateway from 'gateway/ProcessGateway';
import ReporterGateway from 'gateway/ReporterGateway';
import Types from 'common/Types';
import Volume from 'containerization/Volume';

export const iocContainer = new BaseIoc().buildBaseTemplate();

iocContainer.bind(Types.ICache).to(Cache).inSingletonScope();
iocContainer
  .bind(Types.IChildProcessGateway)
  .to(ChildProcessGateway)
  .inSingletonScope();
iocContainer.bind(Types.IEditorGateway).to(EditorGateway).inSingletonScope();
iocContainer.bind(Types.IEnvVar).to(EnvVar).inSingletonScope();
iocContainer.bind(Types.IFsGateway).to(FsGateway).inSingletonScope();
iocContainer.bind(Types.IHttpGateway).to(HttpGateway).inSingletonScope();
iocContainer.bind(Types.IOsGateway).to(OsGateway).inSingletonScope();
iocContainer.bind(Types.IProcessGateway).to(ProcessGateway).inSingletonScope();
iocContainer
  .bind(Types.IReporterGateway)
  .to(ReporterGateway)
  .inSingletonScope();
iocContainer.bind(Types.IVolume).to(Volume).inSingletonScope();
