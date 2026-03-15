# MDH 3D Store

Loja operacional da **MDH 3D** em **Next 15 + PostgreSQL/Supabase + Drizzle**, preparada para catálogo curado, pedido real, painel privado e operação 24/7.

## Stack

- `Next.js 15`
- `PostgreSQL` via `DATABASE_URL`
- `Drizzle ORM + drizzle-kit`
- `Mercado Pago` para checkout de cartão por redirect
- `Pix` com payload/QR local
- sessão admin por cookie `HttpOnly` assinado

## O que já existe

- home de conversão premium
- catálogo curado com 48 SKUs
- quick view, carrinho persistente e checkout guest
- criação real de cliente, endereço, pedido, itens, pagamento e timeline
- painel privado em `/admin`
- consulta pública de pedido em `/acompanhar-pedido`
- postura `guest-first`: checkout continua sem conta obrigatoria
- conta propria do cliente com email, senha e cookie `HttpOnly` persistente
- seed de catálogo + canais de origem
- importador automático de imagens com Openverse/Wikimedia + placeholder premium
- healthcheck em `/api/health`
- instrumentação pronta para GA4 + analytics interno em banco

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```env
DATABASE_URL=
NEXT_PUBLIC_SITE_URL=

ADMIN_EMAIL=
ADMIN_PASSWORD_HASH=
ADMIN_SESSION_SECRET=
CUSTOMER_SESSION_SECRET=

MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_WEBHOOK_SECRET=

PIX_KEY=
PIX_RECEIVER_NAME=
PIX_RECEIVER_CITY=

NEXT_PUBLIC_WHATSAPP_NUMBER=5521920137249
NEXT_PUBLIC_INSTAGRAM_URL=https://www.instagram.com/mdh_impressao3d/
NEXT_PUBLIC_GA_MEASUREMENT_ID=

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Opcional, fora da operação principal desta rodada:
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_TEMPLATE_NAME=mdh_order_update
```

Se você estiver usando Supabase, pegue a connection string em `Connect > Session pooler` e prefira a variante IPv4. O host direto `db.<project-ref>.supabase.co:5432` pode falhar localmente em máquinas Windows sem rota IPv6.
Em muitos projetos Supabase, o usuário da Session pooler segue o padrão `postgres.<project-ref>`.

Para gerar o hash do admin:

```powershell
npm run admin:hash -- sua-senha-forte
```

Se você já tem um `.env.local` antigo no projeto original, migre os nomes legados:

- `ADMIN_PASSWORD` -> gere `ADMIN_PASSWORD_HASH`
- `ADMIN_SESSION_TOKEN` -> use como `ADMIN_SESSION_SECRET`

Para conta do cliente, o padrão canônico agora é:

- cadastro/login próprio com `email + senha`
- sessão persistente em cookie `HttpOnly`
- Google/social apenas como camada opcional futura

Se `CUSTOMER_SESSION_SECRET` ainda não existir no ambiente local, o runtime consegue derivar um fallback a partir de `ADMIN_SESSION_SECRET` para não travar a rodada. Mesmo assim, em deploy o recomendado é configurar `CUSTOMER_SESSION_SECRET` explicitamente.

O painel `/admin` depende de sessão persistida em banco. Se a `DATABASE_URL` estiver indisponível, o login admin falha de forma explícita em vez de aceitar cookie sem persistência.

## Bootstrap local

```powershell
npm install
npm run doctor
npm run db:generate
npm run db:migrate
npm run db:seed
npm run catalog:images
npm run build
npm run dev
```

Se o `doctor` acusar `DATABASE_URL` com host direto do Supabase, troque a URL antes de rodar `db:migrate`.

## Imagens do catálogo

Baixar imagens aproximadas e salvar localmente em `public/catalog-assets`:

```powershell
npm run catalog:images
```

O script tenta `Openverse` e `Wikimedia`. Se não achar resultado bom, gera placeholder premium local.
Para refazer toda a rodada e reavaliar placeholders:

```powershell
npm run catalog:images -- --refresh
```

O relatório final das imagens fica em `public/catalog-assets/catalog-image-report.json`.

## Rotas principais

- Loja: `http://localhost:3000`
- Catálogo: `http://localhost:3000/catalogo`
- Carrinho: `http://localhost:3000/carrinho`
- Checkout: `http://localhost:3000/checkout`
- Acompanhar pedido: `http://localhost:3000/acompanhar-pedido`
- Admin: `http://localhost:3000/admin/login`
- Health: `http://localhost:3000/api/health`
- Login do cliente: `http://localhost:3000/login`
- Conta do cliente: `http://localhost:3000/conta`

## Deploy recomendado

- frontend/app: `Vercel`
- banco: `Supabase Postgres`
- domínio: `Cloudflare` opcional para DNS e borda
- branch canônica de produção: `main`

Passos:

1. Criar banco Supabase e copiar `DATABASE_URL`.
2. Configurar variáveis de ambiente na Vercel.
3. Rodar migrations, seed e importação de imagens no banco hospedado.
4. Publicar.
5. Testar checkout Pix, login admin e consulta de pedido.
6. Se `MERCADOPAGO_ACCESS_TOKEN` não estiver configurado, a loja segue vendendo com Pix + WhatsApp e o cartão fica desabilitado no checkout.
7. Rodar `npm run doctor` depois do deploy para confirmar env, imagens e conexão.
8. Se quiser telemetria externa, preencher `NEXT_PUBLIC_GA_MEASUREMENT_ID`; sem isso, o tracking interno continua funcionando de forma silenciosa.
9. Login social por Supabase pode continuar como camada opcional futura, mas o fluxo principal do cliente agora e email + senha da propria loja.
10. Nenhuma rota crítica de amanhã depende de `localStorage`, mock em memória ou seed mutável para pedido, pagamento, sessão admin ou status.

## Troubleshooting de deploy na Vercel

Se o site publicado parecer antigo mesmo com o repositório atualizado:

1. Confirme que o commit mais novo está em `origin/main`:

```powershell
git fetch origin
git rev-parse origin/main
git log --oneline --decorate -n 3 origin/main
```

2. No dashboard da Vercel, abra `Project Settings > Git` e confirme:
   - `Connected Git Repository` aponta para este repositório
   - `Production Branch` está em `main`
   - não existe `Ignored Build Step` bloqueando deploys de produção
3. No dashboard da Vercel, abra `Deployments` e compare o SHA do último deploy de produção com o SHA de `origin/main`.
4. Se o último deploy falhou, abra os logs do build e redeploye após corrigir o erro.
5. Se o projeto da Vercel estiver conectado a outra branch ou outro repositório, corrija isso antes de testar a URL pública.
6. Garanta que `NEXT_PUBLIC_SITE_URL` em produção aponta para o domínio real publicado, não para `http://localhost:3000`.
7. Depois de ajustar branch/env/logs, force um novo deploy a partir de `main`.

Checklist rápido para produção:

```powershell
git status --short --branch
git fetch origin
git rev-parse HEAD
git rev-parse origin/main
npm run build
```

O ideal é:
- `git status` limpo
- `HEAD` igual a `origin/main`
- `npm run build` verde
- último deploy de produção apontando para o mesmo SHA

## Checklist de operação

1. Entrar em `/admin/login`.
2. Conferir dashboard e fila de pedidos.
3. Testar um pedido Pix pelo `/checkout`.
4. Confirmar atualização manual de pagamento/status no admin.
5. Testar `/acompanhar-pedido` com número do pedido + e-mail/WhatsApp.
6. Conferir `/api/health` e `public/catalog-assets/catalog-image-report.json`.
