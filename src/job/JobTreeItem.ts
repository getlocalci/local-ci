import EditorGateway from 'gateway/EditorGateway';
import type vscode from 'vscode';
import { EXIT_JOB_COMMAND, RUN_JOB_COMMAND } from '../constants';

export default class JobTreeItem implements vscode.TreeItem {
  private jobName: string;
  collapsibleState: vscode.TreeItemCollapsibleState;
  iconPath: vscode.ThemeIcon;
  tooltip: string;
  command: vscode.TreeItem['command'];
  contextValue?: string;
  description?: string;

  constructor(
    private editorGateway: EditorGateway,
    public readonly label: string,
    isRunning: boolean,
    hasChildJob: boolean
  ) {
    const tooltip = `Run the CircleCI® job ${this.label}`;
    this.jobName = label;
    this.collapsibleState = hasChildJob
      ? this.editorGateway.editor.TreeItemCollapsibleState.Expanded
      : this.editorGateway.editor.TreeItemCollapsibleState.None;

    this.iconPath = new this.editorGateway.editor.ThemeIcon('debug-start');
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
    this.iconPath = new this.editorGateway.editor.ThemeIcon('trash');
    this.tooltip = tooltip;
  }

  setIsNotRunning(): void {
    const tooltip = `Run the CircleCI® job ${this.label}`;

    this.contextValue = '';
    this.command = {
      title: this.label,
      command: RUN_JOB_COMMAND,
      arguments: [this.label, this],
      tooltip,
    };
    this.tooltip = tooltip;
    this.iconPath = new this.editorGateway.editor.ThemeIcon('debug-start');
  }

  setIsSuccess(): void {
    this.description = '✅';
  }

  setIsFailure(): void {
    this.description = '❌';
  }

  setExpanded(): void {
    this.collapsibleState =
      this.editorGateway.editor.TreeItemCollapsibleState.Expanded;
  }
}
