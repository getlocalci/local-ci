import * as vscode from 'vscode';
import Command from './Command';

export default class IconCommand extends Command {
  constructor(public readonly label: string, command: string, icon: string) {
    super(label, command);
    this.iconPath = new vscode.ThemeIcon(icon);
  }
}
