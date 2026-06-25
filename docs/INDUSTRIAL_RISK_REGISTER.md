# Industrial Risk Register

| Risk | Status | Mitigation |
| --- | --- | --- |
| DB outage breaks storefront | Mitigated | `DATABASE_REQUIRED=false` keeps Product Master/static fallback active. |
| Redis outage breaks catalog/feed | Mitigated | Cache layer falls back to memory/stale data. |
| Local PC becomes production dependency | Mitigated | Production creates jobs; local agent pulls jobs. Public AI chat uses fallback. |
| Local agent deploys or pushes main | Mitigated | Denylist blocks deploy, force push and main push. |
| Admin AI exposed publicly | Mitigated | Admin AI API routes use `ADMIN_SECRET` or admin session. |
| Feed returns HTML on failure | Existing mitigation | Feed routes return typed empty payloads with error headers. |
| Secrets leak in logs | Mitigated | Redaction helpers and secret scan script. |
| Long jobs run in request path | Mitigated | Jobs queue scaffold and local-agent pull model. |
