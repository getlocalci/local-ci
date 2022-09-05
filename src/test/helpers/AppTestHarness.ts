import Types from 'common/types';
import BaseIOC from 'BaseIoc';
import FakeEditorGateway from 'common/FakeEditorGateway';
import FakeFsGateway from 'common/FakeFsGateway';
import FakeChildProcessGateway from 'common/FakeChildProcessGateway';

export default class AppTestHarness {
  container: any;
  childProcessGateway: any;
  editorGateway: any;
  fsGateway: any;

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

    this.childProcessGateway = this.container.get(Types.IChildProcessGateway);
    this.editorGateway = this.container.get(Types.IEditorGateway);
    this.fsGateway = this.container.get(Types.IFsGateway);
  }
}
