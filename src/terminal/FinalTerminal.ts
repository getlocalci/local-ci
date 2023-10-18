import ChildProcessGateway from 'gateway/ChildProcessGateway';
import EditorGateway from 'gateway/EditorGateway';
import Spawn from 'common/Spawn';

export default class FinalTerminal {
  constructor(
    public childProcessGateway: ChildProcessGateway,
    public editorGateway: EditorGateway,
    public spawn: Spawn
  ) {}

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
