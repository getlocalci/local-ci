import EditorGateway from './EditorGateway';
import TelemetryReporter from '@vscode/extension-telemetry';
import { EXTENSION_ID, TELEMETRY_KEY } from 'constant';

export default class ReporterGateway {
  reporter: TelemetryReporter;

  constructor(private editorGateway: EditorGateway) {
    this.reporter = new TelemetryReporter(
      EXTENSION_ID,
      this.editorGateway.editor.extensions.getExtension(
        EXTENSION_ID
      )?.packageJSON.version,
      TELEMETRY_KEY
    );
  }
}
