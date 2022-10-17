import { Container } from 'inversify';
import Types from 'common/Types';
import BaseIOC from 'common/BaseIoc';
import FakeChildProcessGateway from 'gateway/FakeChildProcessGateway';
import FakeEditorGateway from 'gateway/FakeEditorGateway';
import FakeFsGateway from 'gateway/FakeFsGateway';
import FakeHttpGateway from 'gateway/FakeHttpGateway';
import FakeOsGateway from 'gateway/FakeOsGateway';
import FakeProcessGateway from 'gateway/FakeProcessGateway';
import FakeReporterGateway from 'gateway/FakeReporterGateway';
import FakeEnvVar from 'process/FakeEnvVar';

export default class AppTestHarness {
  container!: Container;
  childProcessGateway!: FakeChildProcessGateway;
  editorGateway!: FakeEditorGateway;
  fsGateway!: FakeFsGateway;
  httpGateway!: FakeHttpGateway;
  osGateway!: FakeOsGateway;
  processGateway!: FakeProcessGateway;
  reporterGateway!: FakeReporterGateway;

  init() {
    this.container = new BaseIOC().buildBaseTemplate();
    this.container
      .bind(Types.IChildProcessGateway)
      .to(FakeChildProcessGateway)
      .inSingletonScope();
    this.container.bind(Types.IEnvVar).to(FakeEnvVar).inSingletonScope();
    this.container
      .bind(Types.IEditorGateway)
      .to(FakeEditorGateway)
      .inSingletonScope();
    this.container.bind(Types.IFsGateway).to(FakeFsGateway).inSingletonScope();
    this.container
      .bind(Types.IHttpGateway)
      .to(FakeHttpGateway)
      .inSingletonScope();
    this.container.bind(Types.IOsGateway).to(FakeOsGateway).inSingletonScope();
    this.container
      .bind(Types.IProcessGateway)
      .to(FakeProcessGateway)
      .inSingletonScope();
    this.container
      .bind(Types.IReporterGateway)
      .to(FakeReporterGateway)
      .inSingletonScope();

    this.childProcessGateway = this.container.get(Types.IChildProcessGateway);
    this.editorGateway = this.container.get(Types.IEditorGateway);
    this.fsGateway = this.container.get(Types.IFsGateway);
    this.httpGateway = this.container.get(Types.IHttpGateway);
    this.osGateway = this.container.get(Types.IOsGateway);
    this.processGateway = this.container.get(Types.IProcessGateway);
    this.reporterGateway = this.container.get(Types.IReporterGateway);
  }
}
