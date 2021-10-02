import * as vscode from 'vscode';
import { EXIT_JOB_COMMAND, RUN_JOB_COMMAND } from './constants';

export default class Job extends vscode.TreeItem {
  private runningTerminals: (number | undefined)[] = [];
  constructor(public readonly label: string) {
    super(label);
    const tooltip = `Runs the CircleCI® job ${this.label}`;
    this.collapsibleState = vscode.TreeItemCollapsibleState.None;

    this.iconPath = new vscode.ThemeIcon('debug-start');
    this.tooltip = `Runs the CircleCI® job ${this.label}`;
    this.command = {
      title: label,
      command: RUN_JOB_COMMAND,
      tooltip,
      arguments: [label, this],
    };
  }

  setIsRunning(): void {
    this.command = {
      title: this.label,
      command: EXIT_JOB_COMMAND,
      tooltip: `Exits the CircleCI® job ${this.label}`,
      arguments: [this],
    };
    this.iconPath = new vscode.ThemeIcon('trash');
  }

  getRunningTerminals(): (number | undefined)[] {
    return this.runningTerminals;
  }

  setRunningTerminals(runningTerminals: (number | undefined)[]): void {
    this.runningTerminals = runningTerminals;
  }

  resetRunningTerminals(): void {
    this.runningTerminals = [];
  }

  setWasExited(): void {
    this.command = {
      title: this.label,
      command: RUN_JOB_COMMAND,
      tooltip: `Runs the CircleCI® job ${this.label}`,
      arguments: [this.label, this],
    };
    this.iconPath = new vscode.ThemeIcon('debug-start');
  }
}
