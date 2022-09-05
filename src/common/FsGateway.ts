import * as fs from 'fs';
import { decorate, injectable } from 'inversify';

class FsGateway {
  fs = fs;
}

decorate(injectable(), FsGateway);
export default FsGateway;
