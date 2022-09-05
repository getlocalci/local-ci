import * as os from 'os';
import { decorate, injectable } from 'inversify';

class OsGateway {
  os = os;
}

decorate(injectable(), OsGateway);
export default OsGateway;
