import * as vscode from 'vscode';
import Command from './Command';

export default class SurveyButton extends Command {
  button?: vscode.TreeItem;

  constructor(public readonly label: string, command: string) {
    super(label, command);
    this.iconPath = new vscode.ThemeIcon('rocket');
  }
}
