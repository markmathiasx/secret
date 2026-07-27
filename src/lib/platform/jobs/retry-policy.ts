export function shouldRetryJob(attempts: number, maxAttempts: number) {
  return attempts < maxAttempts;
}

export function getJobRetryDelayMs(attempts: number) {
  if (attempts <= 1) return 60_000;
  if (attempts === 2) return 5 * 60_000;
  return 15 * 60_000;
}
