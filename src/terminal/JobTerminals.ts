import { inject, injectable } from 'inversify';
import getTerminalName from './getTerminalName';
import getDebuggingTerminalName from './getDebuggingTerminalName';
import getFinalTerminalName from './getFinalTerminalName';
import EditorGateway from 'gateway/EditorGateway';
import Types from 'common/Types';

@injectable()
export default class JobTerminals {
  @inject(Types.IEditorGateway)
  editorGateway!: EditorGateway;

  /** Closes VS Code terminals for a job. */
  dispose(jobName: string): void {
    const terminalNames = [
      getTerminalName(jobName),
      getDebuggingTerminalName(jobName),
      getFinalTerminalName(jobName),
    ];

    this.editorGateway.editor.window.terminals.forEach((terminal) => {
      if (terminalNames.includes(terminal.name) && !terminal.exitStatus) {
        terminal.dispose();
      }
    });
  }
}
