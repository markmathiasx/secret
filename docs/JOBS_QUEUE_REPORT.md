# Jobs Queue Report

Implemented files:

- `src/lib/platform/jobs/*`
- `app/api/admin/jobs/enqueue/route.ts`
- `app/api/admin/jobs/route.ts`
- `app/api/admin/jobs/[id]/route.ts`
- `app/api/local-agent/tasks/route.ts`
- `app/api/local-agent/tasks/[id]/result/route.ts`

Security:

- Admin job endpoints require admin auth/secret.
- Local-agent endpoints require `LOCAL_AGENT_SHARED_SECRET`.
- Job payloads are sanitized and secrets are removed.

Validate:

- `npm run jobs:report`
