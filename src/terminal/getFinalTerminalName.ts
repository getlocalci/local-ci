export default function getFinalTerminalName(jobName: string): string {
  return `Local CI final debugging ${jobName}`;
}
