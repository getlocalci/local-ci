import { decorate, inject, injectable } from 'inversify';
import * as vscode from 'vscode';
import { EXIT_JOB_COMMAND, RUN_JOB_COMMAND } from 'constants/';
import Types from 'common/Types';
import EditorGateway from 'common/EditorGateway';

class JobFactory {
  editorGateway!: EditorGateway;

  create(label: string, isRunning: boolean, hasChildJob: boolean) {
    const job = new this.editorGateway.editor.TreeItem(label);
    const tooltip = `Run the CircleCI® job ${label}`;
    job.collapsibleState = hasChildJob
      ? this.editorGateway.editor.TreeItemCollapsibleState.Expanded
      : this.editorGateway.editor.TreeItemCollapsibleState.None;

    job.iconPath = new this.editorGateway.editor.ThemeIcon('debug-start');
    job.tooltip = tooltip;
    job.command = {
      title: label,
      command: RUN_JOB_COMMAND,
      tooltip,
      arguments: [job.label, this],
    };

    if (isRunning) {
      return this.setIsRunning(job);
    }

    return job;
  }

  getJobName(job: vscode.TreeItem): string {
    return String(job.label);
  }

  setIsRunning(job: vscode.TreeItem): vscode.TreeItem {
    const tooltip = `Exit the CircleCI® job ${job.label}`;

    job.contextValue = 'isRunning';
    job.description = undefined;
    job.command = {
      title: String(job?.label),
      command: EXIT_JOB_COMMAND,
      tooltip,
      arguments: [job],
    };
    job.iconPath = new this.editorGateway.editor.ThemeIcon('trash');
    job.tooltip = tooltip;

    return job;
  }

  setIsNotRunning(job: vscode.TreeItem): vscode.TreeItem {
    const tooltip = `Run the CircleCI® job ${job.label}`;

    job.contextValue = undefined;
    job.command = {
      title: String(job.label),
      command: RUN_JOB_COMMAND,
      arguments: [job.label, this],
      tooltip,
    };
    job.tooltip = tooltip;
    job.iconPath = new this.editorGateway.editor.ThemeIcon('debug-start');

    return job;
  }

  setIsSuccess(job: vscode.TreeItem): vscode.TreeItem {
    job.description = '✅';
    return job;
  }

  setIsFailure(job: vscode.TreeItem): vscode.TreeItem {
    job.description = '❌';
    return job;
  }

  setExpanded(job: vscode.TreeItem): vscode.TreeItem {
    job.collapsibleState =
      this.editorGateway.editor.TreeItemCollapsibleState.Expanded;
    return job;
  }
}

decorate(injectable(), JobFactory);
decorate(inject(Types.IEditorGateway), JobFactory.prototype, 'editorGateway');
export default JobFactory;
