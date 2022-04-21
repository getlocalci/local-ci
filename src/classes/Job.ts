import * as vscode from 'vscode';
import { EXIT_JOB_COMMAND, RUN_JOB_COMMAND } from '../constants';

export default class Job extends vscode.TreeItem {
  private jobName: string;
  public readonly logJobName: string;

  constructor(
    public readonly label: string,
    isRunning: boolean,
    hasChildJob: boolean
  ) {
    super(label);
    this.logJobName = '';
    const tooltip = `Run the CircleCI® job ${this.label}`;
    this.jobName = label;
    this.collapsibleState = hasChildJob
      ? vscode.TreeItemCollapsibleState.Expanded
      : vscode.TreeItemCollapsibleState.None;

    this.iconPath = new vscode.ThemeIcon('debug-start');
    this.tooltip = tooltip;
    this.command = {
      title: label,
      command: RUN_JOB_COMMAND,
      tooltip,
      arguments: [this.jobName, this],
    };

    if (isRunning) {
      this.setIsRunning();
    }
  }

  getJobName(): string {
    return this.jobName;
  }

  setIsRunning(): void {
    const tooltip = `Exit the CircleCI® job ${this.label}`;

    this.contextValue = 'isRunning';
    this.description = undefined;
    this.command = {
      title: this.label,
      command: EXIT_JOB_COMMAND,
      tooltip,
      arguments: [this],
    };
    this.iconPath = new vscode.ThemeIcon('trash');
    this.tooltip = tooltip;
  }

  setIsNotRunning(): void {
    const tooltip = `Run the CircleCI® job ${this.label}`;

    this.contextValue = undefined;
    this.command = {
      title: this.label,
      command: RUN_JOB_COMMAND,
      arguments: [this.label, this],
      tooltip,
    };
    this.tooltip = tooltip;
    this.iconPath = new vscode.ThemeIcon('debug-start');
  }

  setIsSuccess(): void {
    this.description = '✅';
  }

  setIsFailure(): void {
    this.description = '❌';
  }

  reveal(): void {
    this.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
  }
}
