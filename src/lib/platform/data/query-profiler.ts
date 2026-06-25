export type QueryProfileEntry = {
  name: string;
  durationMs: number;
  source: string;
  cacheStatus: string;
  timestamp: string;
};

const entries: QueryProfileEntry[] = [];

export async function profileQuery<T>(
  name: string,
  work: () => Promise<{ value: T; source: string; cacheStatus: string }> | { value: T; source: string; cacheStatus: string }
) {
  const startedAt = performance.now();
  const result = await work();
  entries.push({
    name,
    durationMs: Math.round(performance.now() - startedAt),
    source: result.source,
    cacheStatus: result.cacheStatus,
    timestamp: new Date().toISOString(),
  });
  if (entries.length > 500) entries.splice(0, entries.length - 500);
  return result.value;
}

export function getQueryProfileReport() {
  return {
    total: entries.length,
    entries: [...entries].reverse(),
  };
}
