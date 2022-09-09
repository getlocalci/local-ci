import * as os from 'os';
import { injectable } from 'inversify';

@injectable()
export default class OsGateway {
  os = os;
}
