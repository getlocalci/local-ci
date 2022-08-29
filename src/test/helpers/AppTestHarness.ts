import Types from 'common/types'
import BaseIOC from 'BaseIoc'
import FakeFsGateway from 'common/FakeFsGateway';

export default class AppTestHarness {
  container: any;
  fsGateway: any;

  init() {
    this.container = new BaseIOC().buildBaseTemplate()
    this.container.bind(Types.IFsGateway).to(FakeFsGateway).inSingletonScope()

    this.fsGateway = this.container.get(Types.IFsGateway);
  }
}
