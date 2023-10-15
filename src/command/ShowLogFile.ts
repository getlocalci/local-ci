import type { Command } from '.';
import LogFile from 'log/LogFile';
import { SHOW_LOG_FILE_COMMAND } from 'constant';

export default class ShowLogFile implements Command {
  commandName: string;

  constructor(public logFile: LogFile) {
    this.commandName = SHOW_LOG_FILE_COMMAND;
  }

  getCallback() {
    return (logFilePath: string) => {
      this.logFile.show(logFilePath);
    };
  }
}
