import * as cp from 'child_process';
import { decorate, injectable } from 'inversify';

class ChildProcessGateway {
  cp = cp;
}

decorate(injectable(), ChildProcessGateway);
export default ChildProcessGateway;
