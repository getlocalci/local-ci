import EditorGateway from 'gateway/EditorGateway';

export default class CommandDecorators {
  constructor(public editorGateway: EditorGateway) {}

  get() {
    const isPreCommand = this.editorGateway.editor.workspace
      .getConfiguration('local-ci')
      .get('command.job.enable-pre-command');

    const isPostCommand = this.editorGateway.editor.workspace
      .getConfiguration('local-ci')
      .get('command.job.enable-post-command');

    return {
      getPreCommand: isPreCommand
        ? `echo "Please enter what you want to run before the job command (this will appear in stdout):"; read pre_command;`
        : ``,
      getPostCommand: isPostCommand
        ? `echo "Please enter what you want to run after the job command, followed by enter (you will not see anything as you type):"; read -s post_command;`
        : ``,
      evalPreCommand: isPreCommand ? `eval $pre_command` : ``,
      evalPostCommand: isPostCommand ? `eval $post_command` : ``,
    };
  }
}
