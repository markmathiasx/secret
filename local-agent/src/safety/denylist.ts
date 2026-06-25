const blocked = [
  /rm\s+-rf/i,
  /del\s+\/s/i,
  /\bformat\b/i,
  /powershell\s+iex/i,
  /curl\s+.*\|\s*(sh|powershell)/i,
  /npm\s+publish/i,
  /vercel\s+deploy\s+--prod/i,
  /git\s+push\s+--force/i,
  /git\s+push\s+origin\s+main/i,
  /SECRET|TOKEN|PASSWORD|PRIVATE_KEY/i,
];

export function isDeniedCommand(command: string) {
  return blocked.some((pattern) => pattern.test(command));
}
