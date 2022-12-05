import { injectable } from 'inversify';
import NativeCommandTreeItem from './NativeCommandTreeItem';

@injectable()
export default class NativeCommandFactory {
  create(label: string, command: string) {
    return new NativeCommandTreeItem(label, command);
  }
}
