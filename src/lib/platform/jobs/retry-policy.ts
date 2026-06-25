export function shouldRetryJob(attempts: number, maxAttempts: number) {
  return attempts < maxAttempts;
}
