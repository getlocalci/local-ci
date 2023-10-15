import type vscode from 'vscode';
import WarningFactory from './WarningFactory';

export default class WarningCommandFactory {
  constructor(public warningFactory: WarningFactory) {}

  create(label: string, command: string): vscode.TreeItem {
    return {
      ...this.warningFactory.create(label),
      command: {
        command,
        title: label,
        tooltip: label,
      },
    };
  }
}
