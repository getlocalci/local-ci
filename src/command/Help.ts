import { inject, injectable } from 'inversify';
import type { Command } from './index';
import Types from 'common/Types';
import EditorGateway from 'gateway/EditorGateway';
import ReporterGateway from 'gateway/ReporterGateway';
import { HELP_URL, JOB_TREE_VIEW_ID } from 'constant';

@injectable()
export default class Help implements Command {
  @inject(Types.IEditorGateway)
  editorGateway!: EditorGateway;

  @inject(Types.IReporterGateway)
  reporterGateway!: ReporterGateway;

  commandName: string;

  constructor() {
    this.commandName = `${JOB_TREE_VIEW_ID}.help`;
  }

  getCallback() {
    return () => {
      this.reporterGateway.reporter.sendTelemetryEvent('help');
      this.editorGateway.editor.env.openExternal(
        this.editorGateway.editor.Uri.parse(HELP_URL)
      );
    };
  }
}
