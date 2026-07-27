# Vitrine Implementada - Industrial V6

Data: 2026-07-27

## O que foi implementado nesta fase

### 1. Catalogo publico consolidado em uma rota canonica

- A URL canonica de produto passou a ser `/catalogo/{id}-{slug}` em `lib/catalog.ts`.
- Rotas legadas publicas foram consolidadas para a vitrine curada:
  - `/loja` redireciona para `/catalogo`
  - `/loja/[categoria]/[slug]` redireciona para `/catalogo/[slug]`
  - `/produto/[slug]` tenta reencontrar o item curado e, se nao houver correspondencia direta, redireciona para `/busca?q=...`
  - `/product/[id]` passou a redirecionar para a URL canonica real do produto
- `app/sitemap.ts` e `app/sitemap-products.xml/route.ts` deixaram de publicar a vitrine paralela baseada em `mdh-store`.
- `app/api/feed/google-shopping/route.ts` passou a emitir os links canonicos do catalogo curado.

### 2. Busca util ligada ao catalogo curado

- `app/busca/page.tsx` foi refeito para usar `CatalogExplorer` com:
  - URL compartilhavel em `/busca`
  - filtros coerentes com o catalogo
  - ordenacao comercial
  - historico local
  - estados vazios e retomada
- `components/catalog-explorer.tsx` passou a aceitar `basePath`, permitindo reaproveitar a mesma experiencia em `/catalogo` e `/busca`.
- `lib/catalog-content.ts` recebeu tolerancia basica a erro de digitacao via correspondencia aproximada por token, mantendo sinonimos e ranking ja existentes.
- Foi criado `components/storefront-search-box.tsx` para busca com autocomplete simples e recentes locais nos pontos de entrada da vitrine.

### 3. Home e catalogo alinhados ao fluxo principal

- A home recebeu busca visivel acima da dobra usando o catalogo curado.
- A home ganhou atalhos diretos para:
  - personalizacao real
  - brindes e lotes
  - envio de referencia/arquivo
- Os atalhos de home e catalogo foram corrigidos para usar parametros realmente entendidos pelo explorador (`max`, `sort`, `category`, `custom`, `intent`).
- `components/home-categories-showcase.tsx` foi atualizado para refletir as categorias comerciais atuais da vitrine curada, em vez de rotas tematicas antigas.
- `app/catalogo/page.tsx` agora usa a nova busca com autocomplete e categorias derivadas do catalogo publico atual.

### 4. Personalizacao com carry-over para carrinho

- `components/product-purchase-tools.tsx` passou a carregar e persistir:
  - quantidade
  - objetivo da compra
  - material
  - cor
  - prazo
  - briefing curto
- O briefing agora entra no:
  - resumo enviado ao WhatsApp
  - item salvo no carrinho local
  - sync para `/api/cart`
- A PDP passou a mostrar impacto estimado da configuracao em preco/prazo e a expor CTA explicito para envio de arquivo protegido em `/imagem-para-impressao-3d`.

### 5. Clareza comercial no carrinho

- `components/cart-page-shell.tsx` deixou de vender "frete fixo" como promessa final.
- O carrinho agora trata o valor exibido como estimativa inicial antes do CEP e deixa claro que o frete final e recalculado no checkout.

## Como validar manualmente

### Catalogo e URLs

1. Abrir `/catalogo`.
   Resultado esperado: cards e links apontam para `/catalogo/{id}-{slug}`.
2. Abrir um produto da vitrine.
   Resultado esperado: canonical e navegacao permanecem em `/catalogo/...`.
3. Abrir `/loja`.
   Resultado esperado: redirecionamento para `/catalogo`.
4. Abrir uma URL legada como `/loja/setup-e-home-office/mdh-015-suporte-de-mesa-para-celular`.
   Resultado esperado: redirecionamento para `/catalogo/mdh-015-suporte-de-mesa-para-celular`.
5. Abrir uma URL legada como `/produto/luminaria-led-personalizada`.
   Resultado esperado: redirecionamento para `/busca?q=luminaria%20led%20personalizada`.

### Busca

1. Abrir `/`.
   Resultado esperado: campo de busca visivel acima da dobra com sugestoes e recentes.
2. Abrir `/catalogo`.
   Resultado esperado: campo de busca com autocomplete e chips de consulta rapida.
3. Abrir `/busca?q=chavero`.
   Resultado esperado: resultados relevantes para "chaveiro" apesar do erro simples de digitacao.
4. Ajustar filtros em `/busca`.
   Resultado esperado: a URL deve refletir `q`, `category`, `status`, `material`, `intent`, `custom`, `min`, `max` e `page`.

### PDP, carrinho e personalizacao

1. Abrir um produto personalizavel.
   Resultado esperado: bloco de compra com briefing, impacto de configuracao e CTA para envio de arquivo protegido.
2. Adicionar o item ao carrinho com briefing preenchido.
   Resultado esperado: o resumo do item no carrinho deve manter material, cor, prazo e briefing.
3. Abrir `/carrinho`.
   Resultado esperado: o texto de frete deve falar em estimativa inicial antes do CEP.

## Validacoes executadas nesta fase

- `npm run typecheck`
- `npm run lint:check`
- `npm run build`
- `npm run validate:public-regressions`
- `npm run industrial:v6:verify`
- `npm run validate:assets:fs`
- `npm run test:images`

## Observacoes de validacao

- `industrial:v6:verify` passou com um unico aviso conhecido: `INDUSTRIAL_BASE_COMMIT` nao foi informado, entao a comparacao de migracoes contra uma base nao foi executada.
- O build local terminou com `156` rotas App Router geradas nesta rodada.
- `validate:public-regressions` confirmou `12` produtos publicos ativos.
