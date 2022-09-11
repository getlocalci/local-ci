import Types from 'common/Types';
import BaseIOC from 'common/BaseIoc';
import FakeEditorGateway from 'common/FakeEditorGateway';
import FakeFsGateway from 'common/FakeFsGateway';
import FakeChildProcessGateway from 'common/FakeChildProcessGateway';
import FakeOsGateway from 'common/FakeOsGateway';
import FakeProcessGateway from 'common/FakeProcessGateway';
import FakeHttpGateway from 'common/FakeHttpGateway';
import { Container } from 'inversify';
import FakeReporterGateway from 'common/FakeReporterGateway';

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
