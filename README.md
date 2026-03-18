# MDH 3D Store

Loja Next.js da MDH 3D com:

- catálogo e páginas individuais de produto;
- orçamento rápido e fluxo para imagem/modelo 3D;
- área do cliente com login local por e-mail e senha;
- painel administrativo em `/admin`;
- integrações opcionais com Supabase, Mercado Pago e WhatsApp Cloud API.

## Rodar local

```powershell
Set-Location D:\mdh-3d-store
Copy-Item .env.example .env.local -ErrorAction SilentlyContinue
npm install
npm run dev
```

## Variáveis mínimas

Configure no `.env.local`:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_EMAIL=seu-email@dominio.com
ADMIN_PASSWORD_HASH=
ADMIN_SESSION_SECRET=seu-segredo-longo
AUTH_CUSTOMER_SESSION_SECRET=seu-segredo-longo
AUTH_MAX_CUSTOMERS=100
AUTH_MAX_ADMINS=5
```

Se quiser bootstrap inicial do admin por senha em texto puro, use `ADMIN_PASSWORD` apenas no primeiro acesso e remova depois.

## Login e segurança

- Em produção, contas de clientes e registros de pedido usam Supabase.
- O cofre local `secret/auth-users.json` fica apenas como fallback de desenvolvimento.
- Senhas ficam em hash `scrypt` no servidor.
- Sessões de cliente e admin usam cookies `HttpOnly` assinados.
- O painel administrativo usa `/admin/login`.

## Produção recomendada

Configure estas variáveis no projeto da Vercel:

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
MERCADOPAGO_ACCESS_TOKEN=
```

Sem `SUPABASE_SERVICE_ROLE_KEY`, pedidos e orçamentos não gravam no banco.
Sem `MERCADOPAGO_ACCESS_TOKEN`, o site mantém o fluxo do cartão preparado, mas devolve fallback orientando Pix ou WhatsApp.

## Checks

```powershell
npm run typecheck
npm run lint:check
npm run build
```

## Deploy

GitHub:

```powershell
git add .
git commit -m "feat: secure local auth and admin hardening"
git push origin main
```

Vercel:

```powershell
vercel env add AUTH_CUSTOMER_SESSION_SECRET production
vercel env add AUTH_CUSTOMER_SESSION_SECRET preview
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add MERCADOPAGO_ACCESS_TOKEN production
vercel --prod
```

Use `vercel env pull` para sincronizar o ambiente local com o projeto da Vercel.
