# Hotfix Support Page e Meta Feed

## Diagnostico

- Commit atual de partida: `b83e7be0eac3d6afaf0dea2e6299c4aa75777919`
- Branch: `fix/support-page-and-meta-feed-production`
- Data: 2026-06-06

## Arquivos usados por `/atendimento`

- `app/atendimento/page.tsx`
- `components/support/MDHSupportChat.tsx`
- `components/support/SupportQuickActions.tsx`
- `components/support/SupportProductSuggestions.tsx`
- `components/support/SupportProductCard.tsx`
- `components/support/SupportHumanHandoff.tsx`
- `lib/constants.ts`
- `lib/support/catalog-support-index.ts`
- `lib/support/support-answer-engine.ts`
- `lib/support/support-intent-router.ts`
- `lib/support/support-types.ts`

## Arquivos usados pelo bot

- `app/api/support/chat/route.ts`
- `app/api/support/search-products/route.ts`
- `components/support/MDHSupportChat.tsx`
- `lib/support/catalog-support-index.ts`
- `lib/support/support-answer-engine.ts`
- `lib/support/support-intent-router.ts`
- `lib/support/support-types.ts`
- `lib/security.ts`
- `lib/catalog.ts`
- `lib/payment-pricing.ts`

## Arquivos usados por `/meta/catalog.csv`

- `app/meta/catalog.csv/route.ts`
- `lib/meta-commerce-feed.ts`
- `lib/catalog.ts`
- `lib/product-images.ts`
- `lib/payment-pricing.ts`
- `scripts/meta/validate-commerce-feed.mjs`

## Producao observada antes do hotfix

- `https://www.mdh3d.com.br/atendimento`: status `200`.
- `https://www.mdh3d.com.br/meta/catalog.csv`: status `200`, `Content-Type: text/csv; charset=utf-8`, `X-MDH-Feed-Products: 560`, `X-Vercel-Cache: HIT`.
- O erro `Internal Error` do feed nao foi reproduzido no fetch atual, mas a rota nao tinha `try/catch`; qualquer excecao global na geracao do feed poderia escapar para erro HTML da Vercel.

## Causa provavel de `/atendimento` antigo

- O codigo atual nao contem `@mdh_impressao3d`, `(21) 99999-9999` nem copy publica `fotos reais` em `app/atendimento` ou nos componentes ativos.
- A pagina estava elegivel a HTML estatico/cache de deployment. Isso permite stale HTML em cliente/CDN/aba antiga quando uma versao anterior ainda estava em cache.
- Correcao aplicada: `app/atendimento/page.tsx` agora usa `dynamic = "force-dynamic"` e `revalidate = 0`.

## Conflito entre pagina antiga e componentes novos

- Nao ha conflito de rota entre pagina antiga e componentes novos.
- `/atendimento` importa diretamente `MDHSupportChat`.
- `MDHSupportChat` usa `/api/support/chat`, historico, quick actions e sugestoes de produtos reais.

## Uso de `lib/support`

- `app/atendimento/page.tsx` usa `buildSupportCatalogIndex()` e `getSupportCatalogStats()`.
- `app/api/support/chat/route.ts` usa `buildSupportReply()`.
- O bot usa catalogo real indexado via `lib/support/catalog-support-index.ts`.

## Risco em `lib/meta-commerce-feed.ts`

- A geracao ja pulava produtos invalidos por regras de validacao, mas nao isolava excecoes produto a produto.
- Correcao aplicada: cada produto agora e processado dentro de `try/catch`; produto que gerar excecao e ignorado com motivo `exception_*`.
- Correcao aplicada: `app/meta/catalog.csv/route.ts` agora sempre retorna `text/csv` com status `200`; em falha global, retorna CSV minimo com cabecalho e header `X-MDH-Feed-Error`, nunca HTML/JSON.

## Escopo preservado

- Precos: sem alteracao.
- Catalogo: sem alteracao de dados.
- Checkout/Mercado Pago: sem alteracao.
- Jogos e `/jogue`: sem alteracao.

## Validacao local do hotfix

- `npm run typecheck`: aprovado.
- `npm run lint:check`: aprovado.
- `npm run build`: aprovado; `/atendimento` e `/meta/catalog.csv` ficaram dinamicos.
- `npm run support:validate`: aprovado com 564 produtos indexados.
- `npm run meta:validate-feed`: aprovado com 560 produtos no feed e 4 ignorados.
- `npm run validate:first-sale`: aprovado; WhatsApp, Instagram, jogos, feed e catalogo preservados.
- `npm run security:audit`: aprovado sem achados criticos.
- `git diff --check`: aprovado; apenas avisos LF/CRLF do Windows.
- `http://127.0.0.1:3000/atendimento`: status 200, sem `@mdh_impressao3d`, sem `(21) 99999-9999`, sem `fotos reais`, com `@mdh_3d.com.br` e `5521974137662`.
- `http://127.0.0.1:3000/api/support/chat`: consulta `chaveiro` retornou JSON `ok` com 6 produtos reais.
- `http://127.0.0.1:3000/meta/catalog.csv`: status 200, `text/csv`, 560 produtos, 4 ignorados, sem `Internal Error`.
