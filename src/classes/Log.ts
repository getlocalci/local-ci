import * as vscode from 'vscode';

export default class Log extends vscode.TreeItem {
  private jobName: string;

  constructor(
    public readonly label: string
  ) {
    super(label);
    const tooltip = `Log for the CircleCI® job ${this.label}`;
    this.jobName = label;

    this.iconPath = new vscode.ThemeIcon('output-view-icon');
    this.tooltip = tooltip;
    this.command = {
      title: label,
      command: 'openFile',
      tooltip,
      arguments: [this.jobName, this],
    };
  }

  getJobName(): string {
    return this.jobName;
  }
}
