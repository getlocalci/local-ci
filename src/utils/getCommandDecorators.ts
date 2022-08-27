import * as vscode from 'vscode';

export default function getCommandDecorators() {
  const isPreCommand = vscode.workspace
    .getConfiguration('local-ci')
    .get('command.job.enable-pre-command');

  const isPostCommand = vscode.workspace
    .getConfiguration('local-ci')
    .get('command.job.enable-post-command');

  return {
    getPreCommand: isPreCommand
      ? `echo "Please enter what you want to run before the job command (this will appear in stdout):"; read pre_command;`
      : ``,
    getPostCommand: isPostCommand
      ? `echo "Please enter what you want to run after the job command (this may appear in stdout):"; read -s post_command;`
      : ``,
    evalPreCommand: isPreCommand ? `eval $pre_command` : ``,
    evalPostCommand: isPostCommand ? `eval $post_command` : ``,
  };
}
