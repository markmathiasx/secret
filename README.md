# MDH 3D Store

Marketplace Next.js 15 para impressão 3D com catálogo DB-first, backfill automático de fotos, autenticação buyer/seller/admin, checkout local-first e infraestrutura pronta para rodar 100% no PC.

## Stack atual

- Next.js 15 App Router
- Prisma + PostgreSQL
- Auth.js v5
- Redis
- MailHog
- Stripe baseline + adapter Mercado Pago
- Upload local para imagens e STL

## Subir localmente

```powershell
Set-Location D:\mdh-3d-store
Copy-Item .env.example .env -ErrorAction SilentlyContinue
docker compose up -d postgres redis mailhog
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Se quiser rodar tudo via container:

```powershell
docker compose up --build
```

## Endereços locais

- App: [http://localhost:3000](http://localhost:3000)
- MailHog: [http://localhost:8025](http://localhost:8025)
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

## Contas seed

- Admin: `admin@mdh3d.local` / `admin123456`
- Seller: `seller@mdh3d.local` / `seller123456`
- Buyer: `buyer@mdh3d.local` / `buyer123456`

Troque isso no `.env` antes de usar fora do ambiente local.

## Banco e seed

```powershell
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:studio
```

## Fotos do catálogo

- Produtos com fotos reais validadas continuam usando seus arquivos atuais.
- Os demais produtos recebem URLs estáveis do Picsum com seed baseada no slug.
- O guia para migrar depois para imagens reais está em [COMO-ATUALIZAR-FOTOS.md](./COMO-ATUALIZAR-FOTOS.md).

## Variáveis importantes

- `DATABASE_URL` e `DIRECT_URL`: conexão local do Postgres.
- `AUTH_SECRET`: segredo principal do Auth.js.
- `SMTP_HOST` e `SMTP_PORT`: envio local de e-mails para MailHog.
- `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED` e `NEXT_PUBLIC_APPLE_AUTH_ENABLED`: ligam os botões sociais na UI.
- `UPLOADS_DIR`, `PRODUCT_MEDIA_DIR` e `MODEL_UPLOADS_DIR`: storage local de mídia e STL.

## Checks

```powershell
npm run db:generate
npm run typecheck
npm run lint:check
npm run build
```

## Fluxo recomendado de desenvolvimento

1. Suba `postgres`, `redis` e `mailhog`.
2. Rode `npm run db:migrate`.
3. Rode `npm run db:seed`.
4. Abra a app e valide `/catalogo`, `/catalogo/[slug]`, `/login`, `/checkout`, `/conta` e `/admin`.
5. Veja os e-mails de verificação e reset no MailHog.
