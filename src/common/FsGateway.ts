import * as fs from 'fs';
import { injectable } from 'inversify';

@injectable()
export default class FsGateway {
  fs = fs;
}
