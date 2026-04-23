# ROADMAP MDH 3D

Atualizado em 2026-04-22

## Norte

Transformar o site da MDH 3D em uma maquina web-first de aquisicao e conversao, com paginas comerciais fortes, SEO util, conteudo reaproveitavel e operacao recorrente auditavel.

## Fases

### Fase 1 - Auditar e mapear
Status: em andamento

- [x] Levantar working tree atual e scripts obrigatorios de validacao
- [x] Mapear homepage, catalogo, PDP, landings e admin
- [x] Publicar auditoria tecnica inicial em `docs/AUDITORIA-TECNICA-WEB-FIRST-2026-04-22.md`
- [ ] Rodar auditoria recorrente via script e armazenar snapshot semanal

### Fase 2 - Corrigir estrutura comercial do site
Status: em andamento

- [x] Refatorar homepage para tres funis principais
- [x] Reforcar catalogo com faixa inicial e FAQ comercial
- [x] Reforcar PDP com FAQ e schema mais forte
- [ ] Revisar CTAs e prova nos demais ativos comerciais de topo

### Fase 3 - Implementar SEO tecnico
Status: em andamento

- [x] Criar template de categoria crawlavel em `/catalogo/categoria/[slug]`
- [x] Expandir landings para 20 paginas comerciais/locales
- [x] Adicionar JSON-LD em landings, categorias e PDP
- [x] Atualizar `sitemap.ts` para novas rotas comerciais
- [ ] Rodar auditoria automatica de titles, metas, schema, links, imagens e CWV

### Fase 4 - Criar paginas programaticas uteis
Status: em andamento

- [x] Consolidar configuracao unica de landings em `lib/sales-landings.ts`
- [x] Criar rota dinamica para novas paginas comerciais
- [ ] Revisar copy individual das landings apos dados reais de Search Console

### Fase 5 - Criar pipeline de conteudo
Status: em andamento

- [x] Modelar fila de conteudo produto -> Reel -> carrossel -> Story -> blog -> FAQ
- [x] Criar painel admin em `/admin/content`
- [ ] Persistir status real de aprovacao/publicacao fora de seed estatica

### Fase 6 - Criar dashboard e jobs recorrentes
Status: em andamento

- [x] Criar dashboard semanal com Search Console + metricas internas
- [x] Criar rotas cron para dashboard semanal e auditoria SEO
- [x] Criar scripts locais para acionar os jobs e salvar artefatos em `reports/`
- [ ] Validar em producao com `CRON_SECRET`, Search Console e PageSpeed API ativos

## Entregaveis cobertos neste pacote

- Auditoria tecnica inicial
- Homepage com 3 funis
- Template de categoria com SEO forte
- Template de produto com JSON-LD reforcado
- 20 landing pages comerciais/locales
- Pipeline de conteudo e sistema de aprovacao inicial
- Dashboard semanal e jobs recorrentes
- Documentacao operacional

## Pendencias reais

- Persistencia real do workflow editorial ainda esta seedada em codigo
- Search Console depende de credenciais de service account com permissao de leitura na propriedade
- CWV via PageSpeed depende de `GOOGLE_PAGESPEED_API_KEY`
- Falta executar e revisar os relatórios gerados pelos novos jobs depois do deploy

## Gate de conclusao do pacote

- `npm run lint:check`
- `npm run typecheck`
- `npm run build`
- `npm run validate:assets`
- `npm run test:images`
