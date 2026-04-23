# Auditoria Tecnica Web-First - 2026-04-22

## Resumo executivo

O site ja tinha uma base comercial util em homepage, catalogo e PDP, mas ainda dependia demais de filtros querystring, de poucas landings e de paineis operacionais com foco maior em pedidos do que em aquisicao web-first. O maior gap era estrutural: faltava uma camada unica para transformar intencao comercial em paginas indexaveis, conteudo reaproveitavel e rotina semanal de melhoria.

## Pontos fortes encontrados

- Homepage com sinais de confianca, leitura honesta de foto real x render e CTA para catalogo, briefing e WhatsApp.
- PDP ja trazia Product/Offer em JSON-LD, prova social, compra e personalizacao no mesmo fluxo.
- Catalogo ja possuia filtros e recortes por intencao, alem de seguranca para nao expor itens bloqueados no publico.
- Admin ja tinha base de operacao para catalogo, inbox, pedidos e receita.
- O repositorio ja possuia scripts de validacao, auditoria e governanca de assets.

## Lacunas tecnicas e comerciais observadas

### 1. Descoberta e indexacao

- Havia poucas landings comerciais, o que limitava cobertura para SEO local e intencao de compra.
- A categoria dependia principalmente de querystring, o que reduz compartilhamento e valor organico.
- `sitemap.ts` ainda nao cobria o universo completo de paginas comerciais planejadas.

### 2. Conversao

- A homepage ainda parecia mais vitrine ampla do que maquina de roteamento para tres jornadas principais.
- Catalogo e homepage precisavam deixar a faixa inicial mais explicita.
- Varias paginas comerciais ainda nao tinham FAQ proprio, o que empurra duvida basica para fora do site.

### 3. Operacao de conteudo

- Havia componentes isolados para playbook, mas nao uma fila unica ligando produto, landing e distribuicao social/editorial.
- Nao existia um painel claro de aprovacao/publicacao orientado por estagio.

### 4. Growth loop e automacao

- O admin analytics mostrava operacao, mas nao combinava Search Console com metricas internas.
- Faltava uma rotina programavel de auditoria SEO que inspecionasse HTML real, schema, links, imagens e CWV.
- Faltava trilha objetiva para cron no Vercel.

## Correcoes estruturais aplicadas neste pacote

- Homepage reorganizada com tres funis principais de compra.
- Landings expandidas para 20 paginas comerciais/locales com FAQ, CTA, prova e faixa inicial.
- Novo template crawlavel de categoria em `/catalogo/categoria/[slug]`.
- PDP reforcado com FAQ e schema Product/Offer mais completo.
- Painel `/admin/content` para pipeline e aprovacao de conteudo.
- Novo dashboard semanal em `/admin/analytics`.
- Rotas cron e scripts locais para auditoria SEO e growth report.

## Riscos remanescentes

- Search Console ainda depende de credenciais reais de service account com acesso a propriedade.
- CWV automatizado depende de `GOOGLE_PAGESPEED_API_KEY`.
- O workflow editorial ainda nao persiste estado fora do codigo seedado.
- O desempenho real das novas landings ainda precisa ser medido com dados de producao.

## Proxima rodada recomendada

1. Deployar este pacote em preview/producao.
2. Conectar Search Console e PageSpeed.
3. Rodar `npm run audit:seo-commercial` e `npm run report:weekly-growth`.
4. Ajustar copy e interlinking com base nas primeiras consultas e paginas de entrada.
