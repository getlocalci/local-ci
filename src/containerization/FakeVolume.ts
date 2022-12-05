import { injectable } from 'inversify';

@injectable()
export default class FakeVolume {
  isEmpty = () => false;
}
