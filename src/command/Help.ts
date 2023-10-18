import type { Command } from '.';
import EditorGateway from 'gateway/EditorGateway';
import ReporterGateway from 'gateway/ReporterGateway';
import { HELP_URL, JOB_TREE_VIEW_ID } from 'constant';

export default class Help implements Command {
  commandName: string;

  constructor(
    public editorGateway: EditorGateway,
    public reporterGateway: ReporterGateway
  ) {
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
