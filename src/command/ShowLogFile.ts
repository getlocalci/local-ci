import { inject, injectable } from 'inversify';
import type { Command } from './index';
import { SHOW_LOG_FILE_COMMAND } from 'constants/';
import LogFile from 'log/LogFile';

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
