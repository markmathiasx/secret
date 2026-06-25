export const allowedCommands = [
  "npm run build",
  "npm run lint",
  "npm run typecheck",
  "npm test",
  "npx playwright test",
  "npm run commerce-os:score",
  "node scripts/validate-production-public.ts",
  "git status",
  "git diff",
  "git checkout -b",
  "git add",
  "git commit",
  "git log",
  "git branch",
] as const;

export function isAllowedCommand(command: string) {
  return allowedCommands.some((allowed) => command === allowed || command.startsWith(`${allowed} `));
}
