# Performance And Chaos Report

Implemented scripts:

- `scripts/perf/lighthouse-ci.mjs`
- `scripts/perf/k6-smoke.js`
- `scripts/perf/k6-catalog-load.js`
- `scripts/perf/k6-feed-load.js`
- `scripts/chaos/redis-down-test.ts`
- `scripts/chaos/db-down-test.ts`
- `scripts/chaos/feed-source-fail-test.ts`
- `scripts/chaos/local-agent-offline-test.ts`

If `k6` is not installed, perf scripts write a plan report instead of pretending a load test ran.

Validate:

- `npm run perf:smoke`
- `npm run perf:catalog`
- `npm run chaos:redis-down`
- `npm run chaos:db-down`
