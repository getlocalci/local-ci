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
      const command = `circleci local execute --job ${jobName} || exit 1`;

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
      const dockerDebugCommand = 'docker exec -it $(docker ps -lq) bash';

      debuggingTerminal.show();
      debuggingTerminal.sendText(dockerDebugCommand);

      const finalTerminal = vscode.window.createTerminal({
        name: 'localci final state',
        message:
          'This is the final state inside the container before it exited',
        hideFromUser: true,
      });
      finalTerminal.show();

      const interval = setInterval(() => {
        finalTerminal.sendText(
          `docker commit $( docker ps -lq ) local-ci-${jobName}`
        );
      }, 5000);

      vscode.window.onDidCloseTerminal((t) => {
        clearTimeout(interval);
        if (t.exitStatus && t.exitStatus.code) {
          vscode.window.showInformationMessage(
            `The job ${jobName} failed, opening debugger shell`
          );
          finalTerminal.sendText(`docker run -it local-ci-${jobName}`);
          finalTerminal.show();
        }
      });
    }
  );

  context.subscriptions.push(runActionDisposable);
}
