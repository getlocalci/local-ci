import { inject, injectable } from 'inversify';
import Types from 'common/Types';

@injectable()
export default class FakeHttpGateway {
  get = async () => null;
  post = async () => null;
}
