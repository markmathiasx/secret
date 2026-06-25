const failures = new Map<string, { count: number; openedUntil: number }>();

export function recordCircuitFailure(name: string, threshold = 5, cooldownMs = 30_000) {
  const current = failures.get(name) || { count: 0, openedUntil: 0 };
  current.count += 1;
  if (current.count >= threshold) current.openedUntil = Date.now() + cooldownMs;
  failures.set(name, current);
}

export function recordCircuitSuccess(name: string) {
  failures.delete(name);
}

export function isCircuitOpen(name: string) {
  const current = failures.get(name);
  return Boolean(current && current.openedUntil > Date.now());
}
