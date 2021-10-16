export default function getDebuggingTerminalName(jobName: string): string {
  return `Local CI debugging ${jobName}`;
}
