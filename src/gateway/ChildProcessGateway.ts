import * as cp from 'child_process';
import { injectable } from 'inversify';

@injectable()
export default class ChildProcessGateway {
  cp = cp;
}
