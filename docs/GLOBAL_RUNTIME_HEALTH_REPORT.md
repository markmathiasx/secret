# Global Runtime Health Report

Implemented endpoints:

- `GET /api/health`
- `GET /api/health/liveness`
- `GET /api/health/readiness`
- `GET /api/health/deep`

Rules:

- Liveness is fast and dependency-light.
- Readiness validates Product Master, feeds and optional dependencies.
- Deep health requires admin auth.
- DB/Redis/local-agent absence is not fatal unless configured as required.

Validate:

- `npm run infra:health`
- `npm run global:readiness`
