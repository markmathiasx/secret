# MDH 3D Store — Professional Fullstack (v2.1.0)

Marketplace de alto desempenho para impressão 3D no Rio de Janeiro. Esta versão foi consolidada com foco em conversão real, catálogo curado de 48 SKUs validados e infraestrutura profissional.

## Stack Profissional

- **Frontend:** Next.js 15 (App Router, ISR, PWA)
- **UI/UX:** Tailwind CSS + Framer Motion (foco em conversão)
- **Backend:** Node.js 24 + Prisma + PostgreSQL
- **Security:** CSP Rigoroso, Rate Limiting, Middleware de Auth Assistido
- **Payment:** Integração Mercado Pago (Pix/Cartão)
- **Infrastructure:** Docker Ready, standalone build, CI/CD validado

## Catálogo Real (48 SKUs)

Diferente das versões anteriores com 1000 itens sintéticos, este repositório utiliza agora o **Catálogo Profissional MDH 3D**, composto por 48 produtos reais divididos em:
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

## Contas de Acesso (Ambiente Local)

- **Admin:** `admin@mdh3d.com.br` / `admin123456`
- **Comprador:** `cliente@exemplo.com.br` / `cliente123456`

---
*MDH 3D Store — Produção Local, Excelência Global.*
