import { promisify } from 'util';
import { exec } from 'child_process';
import * as vscode from 'vscode';
import { LocalCiProvider } from './LocalCiProvider';
import { changeCheckoutJob, getCheckoutJobs, getConfigFile } from './utils';

export function activate(context: vscode.ExtensionContext): void {
  const ciProvider = new LocalCiProvider();
  const treeViewId = 'localCi';
  vscode.window.registerTreeDataProvider(treeViewId, ciProvider);
  vscode.commands.registerCommand(`${treeViewId}.refresh`, () =>
    ciProvider.refresh()
  );
  vscode.window.createTreeView(treeViewId, {
    treeDataProvider: ciProvider,
  });

  const runActionDisposable = vscode.commands.registerCommand(
    'localci.runAction',
    async (jobName) => {
      const processFile = 'process.yml';

      const terminal = vscode.window.createTerminal({
        name: 'localci test',
        message: `Running the CircleCI job ${jobName}`,
      });

      const runCommand = promisify(exec);
      try {
        await runCommand(
          `circleci config process ${vscode.workspace.rootPath}/.circleci/config.yml > /tmp/circleci/${processFile}`
        );
      } catch (e) {
        terminal.sendText(
          `echo "Error when processing the config: ${e.message}"`
        );
      }

      await changeCheckoutJob(`/tmp/circleci/${processFile}`);
      const checkoutJobs = await getCheckoutJobs(
        `/tmp/circleci/${processFile}`
      );
      const directoryMatches = vscode.workspace.workspaceFolders.length
        ? vscode.workspace.workspaceFolders[0].name.match(/[^/]+$/)
        : '';
      const directory = directoryMatches ? directoryMatches[0] : '';

      const configFile = await getConfigFile(`/tmp/circleci/${processFile}`);
      const attachWorkspaceSteps = configFile?.jobs[jobName]?.steps.filter(
        (step: { attach_workspace: string }) => Boolean(step.attach_workspace) // eslint-disable-line @typescript-eslint/naming-convention
      );
      const defaultWorkspace = '/home/circleci/project';
      const initialAttachWorkspace = attachWorkspaceSteps.length
        ? attachWorkspaceSteps[0].attach_workspace.at
        : '';
      const attachWorkspace =
        '.' === initialAttachWorkspace || !initialAttachWorkspace
          ? defaultWorkspace
          : initialAttachWorkspace;

      const localVolume = `/tmp/circleci/${directory}`;
      const volume = checkoutJobs.includes(jobName)
        ? `${localVolume}:/tmp/checkout`
        : `${localVolume}:${attachWorkspace}`;
      const debuggingTerminalName = 'localci debugging';
      const finalTerminalName = 'localci final terminal';

      const command = `circleci local execute --job ${jobName} --config /tmp/circleci/${processFile} --debug -v ${volume}`;
      terminal.sendText(`mkdir -p ${localVolume}`);
      terminal.sendText(command);
      terminal.show();

      const setDelay = (milliseconds: number) =>
        new Promise((resolve) => setTimeout(resolve, milliseconds));
      await setDelay(12000);
      const debuggingTerminal = vscode.window.createTerminal({
        name: debuggingTerminalName,
        message: 'This is inside the running container',
      });
      const latestContainer = '$(docker ps -lq)';
      const committedContainerBase = 'local-ci-';

      debuggingTerminal.show();

      // Ensure the latest container is not circleci/picard, which is the container that runs jobs.
      // If it is, keep waiting.
      // Then, start an interactive bash session within the container.
      debuggingTerminal.sendText(`
        until [[ -n ${latestContainer} && "circleci/picard" != $(docker inspect --format='{{.Config.Image}}' ${latestContainer}) ]]
        do
          sleep 5
        done
        docker exec -it ${latestContainer} bash || exit 1`);

      const finalTerminal = vscode.window.createTerminal({
        name: finalTerminalName,
        message: 'Debug the final state of the container',
        hideFromUser: true,
      });

      // Commit the latest container so that this can open an interactive session when it finishes.
      // Contianers exit when they finish.
      // So this creates an alternative container for shell access.
      const interval = setInterval(() => {
        finalTerminal.sendText(
          `docker commit ${latestContainer} ${committedContainerBase}${jobName}`
        );
      }, 5000);

      vscode.window.onDidCloseTerminal((closedTerminal) => {
        clearTimeout(interval);
        if (
          closedTerminal.name === debuggingTerminalName &&
          closedTerminal?.exitStatus?.code
        ) {
          // @todo: handle if debuggingTerminal exits because terminal hasn't started the container.
          finalTerminal.sendText(
            `docker run -it ${committedContainerBase}${jobName}`
          );
          finalTerminal.show();
        }

        if (closedTerminal.name === finalTerminalName) {
          // Remove the image that was a copy of the running CircleCI job container.
          closedTerminal.sendText(
            `docker rmi ${committedContainerBase}${jobName}`
          );
          return;
        }
      });
    }
  );

  context.subscriptions.push(runActionDisposable);
}
