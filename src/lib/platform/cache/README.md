# MDH3D Cache Platform

The cache layer supports Upstash REST for Vercel/serverless, raw TCP Redis for a
self-host profile, and in-memory fallback when Redis is absent.

Patterns implemented:

- cache-aside
- stale-if-error
- namespace prefixing
- TTL per domain
- lock helper for anti-stampede
- hit/miss/stale metrics
- selective invalidation

Secrets and admin-sensitive payloads must be marked as non-cacheable by callers.
