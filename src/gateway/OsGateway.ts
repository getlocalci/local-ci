import { injectable } from 'inversify';
import * as os from 'os';

@injectable()
export default class OsGateway {
  os = os;
}
