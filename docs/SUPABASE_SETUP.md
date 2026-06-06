# Supabase Setup

## Storage

1. Aplique a migration `supabase/migrations/20260606063633_mdh_storage_rls_policies.sql`.
2. Confirme que o bucket `mdh-private-assets` existe e permanece privado.
3. Defina `SUPABASE_STORAGE_BUCKET=mdh-private-assets` na Vercel.
4. Defina `SUPABASE_SERVICE_ROLE_KEY` somente no servidor.

As politicas seguem o modelo oficial de Storage com RLS em `storage.objects`: uploads privados ficam em pastas do usuario autenticado e leitura publica fica restrita ao prefixo `product-public`.

Referencias oficiais verificadas em 2026-06-06:

- Supabase Storage Access Control: https://supabase.com/docs/guides/storage/security/access-control
- Supabase Server-Side Auth: https://supabase.com/docs/guides/auth/server-side
- Supabase Next.js Auth quickstart: https://supabase.com/docs/guides/auth/quickstarts/nextjs

## Banco

Rode as migrations Prisma:

```powershell
npm run db:generate
npm run db:migrate
```

Em produção, nao use fallback local para conta, pedido, arquivo ou auditoria. Se o banco nao estiver configurado, a aplicacao deve falhar em JSON nos fluxos sensiveis.
