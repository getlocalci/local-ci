import { injectable } from 'inversify';

@injectable()
export default class FakeHttpGateway {
  get = async () => null;
  post = async () => null;
}
