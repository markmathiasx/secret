# Operacao Comercial Web-First

## Objetivo

Manter homepage, landings, categorias, PDP, conteudo e automacao trabalhando para a mesma meta: gerar venda pela web com honestidade visual e leitura comercial clara.

## Pilares

### 1. Paginas comerciais

- Home vende por tres funis: catalogo, personalizado/projeto e lote/comercial.
- Landings vendem por intencao de compra e contexto local.
- Categorias vendem por recorte crawlavel, nao so por filtro.
- PDP vende por prova, preco/faixa, FAQ e CTA.

### 2. Conteudo reaproveitavel

- Cada produto ou landing forte deve gerar:
  - Reel
  - Carrossel
  - Story
  - Blog
  - FAQ
- O painel inicial fica em `/admin/content`.
- O objetivo do conteudo e empurrar para pagina comercial, nao para vaidade de alcance.

### 3. Dashboard semanal

- O painel fica em `/admin/analytics`.
- Quando Search Console estiver conectado, revisar:
  - cliques
  - impressoes
  - CTR
  - posicao media
  - top queries
  - top paginas
- Sempre comparar com:
  - pedidos
  - orcamentos
  - briefings em aberto
  - Pix e cartao observados
  - taxa de add to cart e purchase

## Jobs recorrentes

### Auditoria SEO comercial

- Endpoint: `/api/cron/seo-audit`
- Script local: `npm run audit:seo-commercial`
- Artefato local: `reports/seo-commercial-audit.local.json`
- Blob opcional: `reports/seo-commercial-audit.json`

### Dashboard semanal

- Endpoint: `/api/cron/weekly-growth`
- Script local: `npm run report:weekly-growth`
- Artefato local: `reports/weekly-growth-dashboard.local.json`
- Blob opcional: `reports/weekly-growth-dashboard.json`

## Credenciais necessarias

### Search Console

- `GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL`
- `GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY`
- `GOOGLE_SEARCH_CONSOLE_SITE_URL`

### CWV via PageSpeed

- `GOOGLE_PAGESPEED_API_KEY`

### Cron seguro na Vercel

- `CRON_SECRET`

## Regras editoriais

- Nunca tratar placeholder como foto real.
- Nunca publicar pagina thin ou copy duplicada.
- Toda pagina comercial precisa de CTA, prova, FAQ e faixa inicial ou orcamento.
- Se houver conflito entre estetica e honestidade, vence honestidade.

## Validacao obrigatoria antes de fechar pacote

- `npm run lint:check`
- `npm run typecheck`
- `npm run build`
- `npm run validate:assets`
- `npm run test:images`
