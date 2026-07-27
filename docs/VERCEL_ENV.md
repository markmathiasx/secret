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

## Loja inteligente, atendimento e analytics

- `NEXT_PUBLIC_WHATSAPP_NUMBER=5521974137662`
- `WHATSAPP_NUMBER=5521974137662`
- `VITE_WHATSAPP_NUMBER=5521974137662`
- `NEXT_PUBLIC_NUVEMSHOP_BASE_URL`
- `NUVEMSHOP_BASE_URL`
- `VITE_NUVEMSHOP_BASE_URL`
- `NEXT_PUBLIC_GTM_ID` ou `VITE_GTM_ID` (opcional)
- `NEXT_PUBLIC_META_PIXEL_ID` ou `VITE_META_PIXEL_ID` (opcional)
- `NEXT_PUBLIC_TIKTOK_PIXEL_ID` ou `VITE_TIKTOK_PIXEL_ID` (opcional)
- `MDH_FILAMENT_PRICE_PER_KG=100`
- `VITE_MDH_FILAMENT_PRICE_PER_KG=100`

Se GTM, Meta Pixel ou TikTok Pixel ficarem vazios, o app nao deve carregar scripts externos nem quebrar a loja.

## Checkout, pedidos e email

- `MERCADOPAGO_ACCESS_TOKEN`
- `NEXT_PUBLIC_MP_PUBLIC_KEY`
- `MERCADOPAGO_WEBHOOK_SECRET`
- `MERCADOPAGO_FALLBACK_EMAIL`
- `EMAIL_PROVIDER=resend`
- `RESEND_API_KEY`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `EMAIL_FROM`
- `REDIS_URL` ou `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`

Sem credenciais reais de Mercado Pago, banco e email, o checkout avancado deve permanecer em fallback/sandbox e isso precisa aparecer no relatorio de execucao.

Em Vercel Production, prefira `EMAIL_PROVIDER=resend`, `sendgrid` ou `mailgun`. SMTP so deve ser usado com host real; `localhost`, `127.0.0.1` e `0.0.0.0` bloqueiam readiness de producao.

## Validacao antes do deploy

```powershell
npm run typecheck
npm run lint:check
npm run build
npm run marketplace:axe
npm run marketplace:audit-phases
npm run validate:industrial-ui
npm run validate:auth
npm run validate:db-storage
npm run validate:private-routes
npm run validate:public-regressions
npm run security:scan-secrets
npm run production:readiness
```

`production:readiness` nao imprime valores de secrets. Ele verifica chaves presentes em variaveis de ambiente locais ou no arquivo ignorado `.vercel/.env.production.local`, confirma vinculo Vercel por `.vercel/project.json` ou `VERCEL_ORG_ID`/`VERCEL_PROJECT_ID`, valida CLI Supabase via npm e bloqueia deploy com placeholders, chaves de teste do Mercado Pago, `DATABASE_URL`/`DIRECT_URL` invalidas ou policies Supabase sem papel explicito.
