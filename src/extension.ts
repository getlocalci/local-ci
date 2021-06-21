import * as vscode from 'vscode';
import { LocalCiProvider } from './LocalCiProvider';

export function activate(context: vscode.ExtensionContext): void {
  const ciProvider = new LocalCiProvider(vscode.workspace);
  vscode.window.registerTreeDataProvider('localCi', ciProvider);
  vscode.commands.registerCommand('localCi.refresh', () =>
    ciProvider.refresh()
  );
  vscode.window.createTreeView('localCi', {
    treeDataProvider: ciProvider,
  });

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "localci" is now active!');

  const disposable = vscode.commands.registerCommand('localci.welcome', () => {
    console.log('inside welcome!');
  });

  context.subscriptions.push(disposable);

  const runActionDisposable = vscode.commands.registerCommand(
    'localci.runAction',
    async (jobName) => {
      const command = `circleci local execute --job ${jobName}`;

      const terminal = vscode.window.createTerminal({
        name: 'localci test',
        message: `Running the CircleCI job ${jobName}`,
      });
      terminal.sendText(command);
      terminal.show();

      const setDelay = (milliseconds: number) =>
        new Promise((resolve) => setTimeout(resolve, milliseconds));
      await setDelay(12000);
      const debuggingTerminal = vscode.window.createTerminal({
        name: 'localci debugging',
        message: 'This is inside the running container',
      });
      const dockerDebugCommand =
        'docker exec -it $(docker ps -lq) bash || exit 1';

      debuggingTerminal.show();
      debuggingTerminal.sendText(dockerDebugCommand);

      const finalTerminal = vscode.window.createTerminal({
        name: 'localci commit image',
        message: 'Debug the final state of the container',
      });

      const interval = setInterval(() => {
        finalTerminal.sendText(
          `docker commit $( docker ps -lq ) local-ci-${jobName}`
        );
      }, 5000);

      vscode.window.onDidCloseTerminal((t) => {
        clearTimeout(interval);

        if (t.exitStatus && t.exitStatus.code) {
          // @todo: handle if debuggingTerminal exits because terminal hasn't started the container.
          vscode.window.showInformationMessage(
            `The job ${jobName} exited, opening a debugging shell`
          );
          finalTerminal.sendText(`docker run -it local-ci-${jobName}`);
          finalTerminal.sendText(`cd ~/passwords-evolved`);
          finalTerminal.show();
        }
      });
    }
  );

  context.subscriptions.push(runActionDisposable);
}
