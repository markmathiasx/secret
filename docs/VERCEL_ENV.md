# Vercel Environment

Configure as variaveis abaixo no ambiente Production do projeto Vercel. Nao commitar valores reais.

## Obrigatorias para auth e banco

- `NEXT_PUBLIC_SITE_URL=https://www.mdh3d.com.br`
- `AUTH_URL=https://www.mdh3d.com.br`
- `NEXTAUTH_URL=https://www.mdh3d.com.br`
- `AUTH_SECRET`
- `ADMIN_SESSION_SECRET`
- `AUTH_CUSTOMER_SESSION_SECRET`
- `DATABASE_URL`
- `DIRECT_URL`

## Supabase Storage

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET=mdh-private-assets`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Use publishable/anon key apenas no cliente. Use service/secret key apenas em route handlers e codigo server-side.

## Validacao antes do deploy

```powershell
npm run typecheck
npm run lint:check
npm run build
npm run validate:industrial-ui
npm run validate:auth
npm run validate:db-storage
npm run validate:private-routes
npm run validate:public-regressions
```
