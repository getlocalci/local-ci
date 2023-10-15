import type vscode from 'vscode';
import Config from 'config/Config';
import ConfigFile from 'config/ConfigFile';
import EditorGateway from 'gateway/EditorGateway';
import getCheckoutJobs from 'job/getCheckoutJobs';
import getConfig from 'config/getConfig';
import getDebuggingTerminalName from 'terminal/getDebuggingTerminalName';
import getFinalTerminalName from 'terminal/getFinalTerminalName';
import JobProvider from 'job/JobProvider';
import ReporterGateway from 'gateway/ReporterGateway';

import { RUN_JOB_COMMAND } from 'constant';

export default class RunWalkthroughJob {
  commandName: string;

  constructor(
    public config: Config,
    public configFile: ConfigFile,
    public editorGateway: EditorGateway,
    public reporterGateway: ReporterGateway
  ) {
    this.commandName = 'local-ci.runWalkthroughJob';
  }

  getCallback(context: vscode.ExtensionContext, jobProvider: JobProvider) {
    return async () => {
      this.reporterGateway.reporter.sendTelemetryEvent('runWalkthroughJob');
      const configFilePath = await this.configFile.getPath(context);
      const { processedConfig } = this.config.process(
        configFilePath,
        this.reporterGateway.reporter
      );

      const checkoutJobs = getCheckoutJobs(getConfig(processedConfig));
      if (!checkoutJobs.length) {
        return;
      }

      const jobName = checkoutJobs[0];
      jobProvider.setRunningJob(jobName);

      this.editorGateway.editor.commands.executeCommand(
        'workbench.view.extension.localCiDebugger'
      );
      this.editorGateway.editor.commands.executeCommand(
        RUN_JOB_COMMAND,
        jobName
      );
      this.editorGateway.editor.window.showInformationMessage(
        `👈 The job ${jobName} is now running in your local`
      );

      this.editorGateway.editor.window.onDidOpenTerminal(async (terminal) => {
        if (terminal.name === getDebuggingTerminalName(jobName)) {
          terminal.show();
          this.editorGateway.editor.window.showInformationMessage(
            `👈 Here's an interactive bash shell of the job. Enter something, like whoami`
          );
        } else if (terminal.name === getFinalTerminalName(jobName)) {
          terminal.show();
          this.editorGateway.editor.window.showInformationMessage(
            `👈 Here's another bash shell now that the job exited`
          );
        }
      });
    };
  }
}
