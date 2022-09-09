import Types from 'common/Types';
import BaseIOC from 'BaseIoc';
import FakeEditorGateway from 'common/FakeEditorGateway';
import FakeFsGateway from 'common/FakeFsGateway';
import FakeChildProcessGateway from 'common/FakeChildProcessGateway';
import FakeOsGateway from 'common/FakeOsGateway';
import ProcessGateway from 'common/ProcessGateway';
import FakeProcessGateway from 'common/FakeProcessGateway';

export default class AppTestHarness {
  container!: IocContainer;
  childProcessGateway!: FakeChildProcessGateway;
  editorGateway!: FakeEditorGateway;
  fsGateway!: FakeFsGateway;
  osGateway!: FakeOsGateway;
  processGateway!: ProcessGateway;

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
    this.container.bind(Types.IOsGateway).to(FakeOsGateway).inSingletonScope();
    this.container
      .bind(Types.IProcessGateway)
      .to(FakeProcessGateway)
      .inSingletonScope();

    this.childProcessGateway = this.container.get(Types.IChildProcessGateway);
    this.editorGateway = this.container.get(Types.IEditorGateway);
    this.fsGateway = this.container.get(Types.IFsGateway);
    this.osGateway = this.container.get(Types.IOsGateway);
    this.processGateway = this.container.get(Types.IProcessGateway);
  }
}
