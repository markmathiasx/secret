# Redis Cache Report

Implemented files:

- `src/lib/platform/cache/*`
- `app/api/health/cache/route.ts`
- `app/api/admin/platform/cache-report/route.ts`
- `app/api/admin/platform/cache-invalidate/route.ts`
- `app/api/admin/platform/cache-warmup/route.ts`

Behavior:

- Upstash REST supported for Vercel/serverless.
- TCP Redis supported for self-host profile.
- In-memory fallback is used when Redis is absent.
- Cache-aside, stale-if-error, invalidation, locks and metrics are implemented.

Validate:

- `npm run cache:health`
- `GET /api/health/cache`

Rollback:

- Set `CACHE_ENABLED=false`.
