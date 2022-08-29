export default function getTerminalName(jobName: string): string {
  return `Local CI ${jobName}`;
}
