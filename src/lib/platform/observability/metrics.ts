const counters = new Map<string, number>();

export function incrementMetric(name: string, amount = 1) {
  counters.set(name, (counters.get(name) || 0) + amount);
}

export function getMetricsReport() {
  return {
    generatedAt: new Date().toISOString(),
    counters: Object.fromEntries([...counters.entries()].sort()),
  };
}
