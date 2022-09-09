import { injectable } from 'inversify';

@injectable()
export default class ProcessGateway {
  process = process;
}
