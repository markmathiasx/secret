# MDH3D Database Platform

Runtime requests use `DATABASE_URL`. Migrations and CLI tasks use `DIRECT_URL`.

`DATABASE_REQUIRED=false` keeps the storefront alive with the Product Master/static
fallback when the database is absent. `DATABASE_REQUIRED=true` makes readiness fail
if `DATABASE_URL` is missing or unreachable.

Connection strings are never returned by health endpoints; only masked metadata is
exposed.
