import { inject, injectable } from 'inversify';
import type { Command } from './index';
import LogFile from 'log/LogFile';
import { SHOW_LOG_FILE_COMMAND } from 'constant';

@injectable()
export default class ShowLogFile implements Command {
  @inject(LogFile)
  logFile!: LogFile;

  commandName: string;

  constructor() {
    this.commandName = SHOW_LOG_FILE_COMMAND;
  }

  getCallback() {
    return (logFilePath: string) => {
      this.logFile.show(logFilePath);
    };
  }
}
