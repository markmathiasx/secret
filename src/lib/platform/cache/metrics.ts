type CacheMetric = {
  hits: number;
  misses: number;
  staleHits: number;
  errors: number;
  sets: number;
  deletes: number;
  locks: number;
};

const metrics: CacheMetric = {
  hits: 0,
  misses: 0,
  staleHits: 0,
  errors: 0,
  sets: 0,
  deletes: 0,
  locks: 0,
};

export function recordCacheMetric(name: keyof CacheMetric) {
  metrics[name] += 1;
}

export function getCacheMetrics() {
  const totalReads = metrics.hits + metrics.misses + metrics.staleHits;
  return {
    ...metrics,
    totalReads,
    hitRate: totalReads ? Number(((metrics.hits + metrics.staleHits) / totalReads).toFixed(4)) : 0,
  };
}

export function resetCacheMetrics() {
  Object.keys(metrics).forEach((key) => {
    metrics[key as keyof CacheMetric] = 0;
  });
}
