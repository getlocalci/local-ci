import NativeCommandTreeItem from './NativeCommandTreeItem';

export default class NativeCommandFactory {
  create(label: string, command: string) {
    return new NativeCommandTreeItem(label, command);
  }
}
