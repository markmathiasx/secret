# Supabase Setup

## Storage

1. Aplique a migration `supabase/migrations/20260606063633_mdh_storage_rls_policies.sql`.
2. Confirme que o bucket `mdh-private-assets` existe e permanece privado.
3. Defina `SUPABASE_STORAGE_BUCKET=mdh-private-assets` na Vercel.
4. Defina `SUPABASE_SERVICE_ROLE_KEY` somente no servidor.

As politicas seguem o modelo oficial de Storage com RLS em `storage.objects`: uploads privados ficam em pastas do usuario autenticado e leitura publica fica restrita ao prefixo `product-public`.

## RLS e Data API

1. Aplique tambem `supabase/migrations/20260727082221_harden_rls_policy_targets.sql`.
2. Revise que tabelas publicas expostas tenham RLS habilitado, policies com `TO authenticated` ou `TO anon, authenticated` explicito e grants minimos.
3. Rode `npm run production:readiness` antes de qualquer deploy de producao.

Referencias oficiais verificadas em 2026-07-27:

- Supabase Storage Access Control: https://supabase.com/docs/guides/storage/security/access-control
- Supabase Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase Data API grants: https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically
- Supabase Server-Side Auth: https://supabase.com/docs/guides/auth/server-side
- Supabase Next.js Auth quickstart: https://supabase.com/docs/guides/auth/quickstarts/nextjs

## Banco

Rode as migrations Prisma:

```powershell
npm run db:generate
npm run db:migrate
```

Em produção, nao use fallback local para conta, pedido, arquivo ou auditoria. Se o banco nao estiver configurado, a aplicacao deve falhar em JSON nos fluxos sensiveis.
