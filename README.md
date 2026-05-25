# MDH 3D Store — Professional Fullstack

Marketplace de alto desempenho para impressão 3D no Rio de Janeiro, com catálogo público preservado, vitrine de conversão, checkout, admin e atendimento integrados.

## Stack Profissional

- **Frontend:** Next.js 15 (App Router, ISR, PWA)
- **UI/UX:** Tailwind CSS + Framer Motion (foco em conversão)
- **Backend:** Node.js 24 + Prisma + PostgreSQL
- **Security:** CSP Rigoroso, Rate Limiting, Middleware de Auth Assistido
- **Payment:** Integração Mercado Pago (Pix/Cartão)
- **Infrastructure:** Docker Ready, standalone build, CI/CD validado

## Catálogo Público

O catálogo público é preservado a partir das fontes reais do projeto e não deve ser substituído por uma amostra reduzida. Curadorias menores podem existir como coleção ou destaque, mas sem apagar IDs existentes usados por PDP, carrinho, checkout, admin e SEO.

Categorias principais:
- Setup & Organização
- Casa & Decoração
- Utilidades Reais
- Presentes Criativos
- Geek & Colecionáveis Autorais
- Projetos Sob Encomenda

## Instalação e Execução

```powershell
# Configuração inicial
copy .env.example .env
docker compose up -d

# Preparação do ambiente
npm install
npm run db:generate
npm run db:migrate
npm run db:seed

# Desenvolvimento
npm run dev
```

## Painel Admin Consolidado

O antigo `/painel-mdh-85` foi substituído por uma estrutura de `/admin` protegida e integrada, com fluxos de:
- Gestão de Pedidos
- Controle de Inventário
- Reprecificação Dinâmica
- Auditoria de SEO e Conversão

## Scripts de Manutenção

- `npm run doctor`: Diagnóstico completo do ambiente.
- `npm run catalog:reprice`: Aplica políticas de preço em lote.
- `npm run validate`: Pipeline completo de sanidade (Build + Typecheck + Lint).
- `npm run seo:validate`: Auditoria técnica de SEO e Schemas.

## Contas de Acesso

Use variáveis locais para criar contas de seed. Somente desenvolvimento local; nunca usar em produção.

- **Admin:** `ADMIN_EMAIL=<admin-email>` e `ADMIN_PASSWORD_HASH=<scrypt-password-hash>`
- **Vendedor seed:** `SEED_SELLER_EMAIL=<seed-seller-email>` e `SEED_SELLER_PASSWORD=<seed-seller-password>`
- **Comprador seed:** `SEED_BUYER_EMAIL=<seed-buyer-email>` e `SEED_BUYER_PASSWORD=<seed-buyer-password>`

---
*MDH 3D Store — Produção Local, Excelência Global.*
