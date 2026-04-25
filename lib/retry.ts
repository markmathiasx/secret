/**
 * Retry a promise-returning function with exponential backoff and jitter.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
    shouldRetry?: (error: unknown, attempt: number) => boolean;
  } = {},
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelayMs = 300,
    maxDelayMs = 8_000,
    shouldRetry = () => true,
  } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts || !shouldRetry(error, attempt)) break;

      // Exponential backoff with 10% jitter
      const base = Math.min(baseDelayMs * Math.pow(2, attempt - 1), maxDelayMs);
      const delay = base + Math.random() * base * 0.1;
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastError;
}

/**
 * Fire-and-forget: run a task with retry but don't block the caller.
 * Swallows all errors after exhausting retries (logs to console.warn).
 */
export function retryBackground<T>(
  label: string,
  fn: () => Promise<T>,
  options?: Parameters<typeof withRetry>[1],
): void {
  withRetry(fn, options).catch((err) => {
    console.warn(`[retry] ${label} failed after retries:`, err instanceof Error ? err.message : err);
  });
}
