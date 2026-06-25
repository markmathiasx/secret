# Industrial Architecture Audit

## Frontend

Public routes remain in `app/`: `/`, `/loja`, `/ofertas`, `/catalogo`, `/produto/[slug]`, `/carrinho`, `/checkout`, `/pedidos`, `/atendimento`, `/jogue`, `/como-funciona`, `/blog` and the NeoGlass preview.

Global layout remains `app/layout.tsx`. Admin pages are under `/admin` and protected by middleware/session.

## Backend/API

Existing API routes cover admin, checkout, feeds, catalog, support, auth and webhooks. The industrial layer adds:

- `/api/health/liveness`
- `/api/health/readiness`
- `/api/health/deep`
- `/api/health/db`
- `/api/health/cache`
- `/api/admin/platform/*`
- `/api/admin/jobs/*`
- `/api/local-agent/tasks`
- `/api/ai-chat/*`
- `/api/admin/ai-chat/*`

## Data

Product Master/static catalog remains the public fallback. Database and Redis are optional runtime dependencies.

## Infra

Vercel remains the production target. The new readiness/liveness endpoints are compatible with Vercel and a future self-host profile.

## Risk Findings

- DB was already optional but lacked an explicit platform health policy.
- Redis existed through Upstash helper but lacked stale fallback, metrics and invalidation endpoints.
- AI local had to be isolated from production critical path.
- Admin AI and local-agent routes must always require secrets/session.
