import * as cp from 'child_process';
import EditorGateway from './EditorGateway';

/**
 * Not used in the production build.
 *
 * To debug the bash commands run with ChildProcessGateway.cp.spawn(),
 * replace ChildProcessGateway with this file in CompositionRoot.ts.
 */
export default class LoggingChildProcessGateway {
  cp;
  outputChannel;
  outputChannelId = 'Local CI';

  constructor(private editorGateway: EditorGateway) {
    this.cp = {
      ...cp,
      spawn: (
        command: string,
        args: string[],
        options: cp.SpawnOptionsWithoutStdio | undefined
      ) => {
        const process = cp.spawn(command, args, options);
        this.logOutputInEditor(process, args);

        return process;
      },
    };

    this.outputChannel = this.editorGateway.editor.window.createOutputChannel(
      this.outputChannelId
    );
  }

  logOutputInEditor(
    childProcess: cp.ChildProcessWithoutNullStreams,
    args: string[]
  ) {
    childProcess?.stdout.on('data', (data) => {
      this.outputChannel?.append(`Running:
        ${args.join(`\n`)}
      `);
      this.outputChannel?.append(data?.toString());
    });

    childProcess?.stderr.on('data', (data) => {
      this.outputChannel?.append(`Error when running:
        ${args.join(`\n`)}
      `);
      this.outputChannel?.append(data?.toString());
    });
  }
}
