import { inject, injectable } from 'inversify';
import TelemetryReporter from '@vscode/extension-telemetry';
import { EXTENSION_ID, TELEMETRY_KEY } from 'constant';
import Types from 'common/Types';
import EditorGateway from './EditorGateway';

@injectable()
export default class ReporterGateway {
  reporter: TelemetryReporter;

  constructor(
    @inject(Types.IEditorGateway) private editorGateway: EditorGateway
  ) {
    this.reporter = new TelemetryReporter(
      EXTENSION_ID,
      this.editorGateway.editor.extensions.getExtension(
        EXTENSION_ID
      )?.packageJSON.version,
      TELEMETRY_KEY
    );
  }
}
