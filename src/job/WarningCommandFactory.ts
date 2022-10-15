import { inject, injectable } from 'inversify';
import type vscode from 'vscode';
import WarningFactory from './WarningFactory';

@injectable()
export default class WarningCommandFactory {
  @inject(WarningFactory)
  warningFactory!: WarningFactory;

  create(label: string, command: string): vscode.TreeItem {
    const warning = this.warningFactory.create(label);
    warning.command = {
      command,
      title: label,
      tooltip: label,
    };

    return warning;
  }
}
