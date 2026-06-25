# Industrial Security Runbook

Implemented files:

- `src/lib/platform/security/secrets.ts`
- `src/lib/platform/security/admin-auth.ts`
- `src/lib/platform/security/cron-auth.ts`
- `src/lib/platform/security/local-agent-auth.ts`
- `src/lib/platform/security/rate-limit.ts`
- `src/lib/platform/security/ssrf-guard.ts`
- `src/lib/platform/security/sanitize.ts`
- `src/lib/platform/security/audit-log.ts`
- `src/lib/platform/security/csp.ts`
- `src/lib/platform/security/headers.ts`

Rules:

- Admin endpoints require `ADMIN_SECRET` or admin session.
- Cron endpoints require `CRON_SECRET`.
- Local agent endpoints require `LOCAL_AGENT_SHARED_SECRET`.
- SSRF guard blocks private hosts and private IPs.
- Logs redact tokens and secrets.
- Mutations write audit events.

Validate:

- `npm run security:scan-secrets`
- `npm run verify:industrial`
