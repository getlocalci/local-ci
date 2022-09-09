import { inject, injectable } from 'inversify';
import Types from 'common/Types';
import Spawn from 'common/Spawn';
import ChildProcessGateway from 'common/ChildProcessGateway';
import EditorGateway from 'common/EditorGateway';

@injectable()
export default class FinalTerminal {
  @inject(Types.IChildProcessGateway)
  childProcessGateway!: ChildProcessGateway;

  @inject(Types.IEditorGateway)
  editorGateway!: EditorGateway;

  @inject(Spawn)
  spawn!: Spawn;

  // @todo: this isn't working.
  // It probably needs to run the logic to get the latest image again.
  showHelperMessages(finalTerminalContainerId: string): void {
    const trivialMessages = [
      '_XSERVTransmkdir',
      'Server is already active for display',
    ];

    const { stdout } = this.childProcessGateway.cp.spawn(
      '/bin/sh',
      ['-c', `docker logs --follow ${finalTerminalContainerId}`],
      this.spawn.getOptions()
    );

    stdout.on('data', (data) => {
      if (!data?.toString) {
        return;
      }

      if (
        trivialMessages.some((trivialMessage) =>
          data.toString().includes(trivialMessage)
        )
      ) {
        this.editorGateway.editor.window.showInformationMessage(
          `👈 If you click return in the terminal, you should be able to debug this. This error is for the X11 (graphical) server.`
        );
      }
    });
  }
}
