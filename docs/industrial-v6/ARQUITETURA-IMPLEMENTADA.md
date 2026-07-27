# MDH 3D Industrial V6 — Arquitetura Implementada

Data de consolidação: 2026-07-27

## Fontes únicas consolidadas

### Catálogo público e comercial

- `data/commercial-storefront.json` define a lista pública curada de 12 SKUs comerciais e os overrides de cópia, custo operacional e preço.
- `lib/commercial-catalog-policy.ts` é a política única de visibilidade comercial e de aplicação dos overrides públicos.
- `lib/catalog.ts` continua sendo a composição principal do catálogo, mas a exportação pública final é reduzida por `applyCommercialCatalogVisibility(...)`.
- `lib/catalog-repository.ts`, `lib/public-catalog.ts`, `src/lib/catalog/normalize.ts` e `lib/products.ts` passaram a consumir a mesma curadoria comercial em vez de listas paralelas divergentes.

### Disponibilidade e estoque público

- `lib/product-availability.ts` passou a ser a fonte única para:
  - `availabilityMode`
  - quantidade pública de estoque
  - rótulo público
  - disponibilidade de Schema.org
  - disponibilidade de feeds de commerce
- Consumidores adaptados:
  - `app/catalogo/[slug]/page.tsx`
  - `app/busca/page.tsx`
  - `components/product-social-proof.tsx`
  - `lib/meta-commerce-feed.ts`
  - `lib/schema-org.ts`
  - `app/merchant/products.xml/route.ts`
  - `app/api/feed/google-shopping/route.ts`

### Checkout e vitrine

- `lib/products.ts` deixou de manter uma lista fixa própria de SKUs comerciais e passou a derivar de `COMMERCIAL_STOREFRONT_IDS`.
- `app/api/checkout/preference/route.ts` continua resolvendo itens por `findStorefrontProductById(...)`, mas agora essa camada depende da mesma curadoria comercial aprovada e não quebra quando um SKU sai da vitrine.
- A vitrine comercial não usa mais SKUs `BLOCKED`/placeholder como `mdh-040`, `mdh-043` e `mdh-044`.

## Segurança e contratos

### Mercado Pago

- `lib/mercadopago-signature.ts` passou a concentrar parsing, timestamp, janela de replay e verificação HMAC da assinatura.
- `lib/mercadopago.ts` mantém request helpers e reexporta as funções puras de assinatura.
- `app/api/webhooks/mercadopago/route.ts` valida:
  - presença da assinatura
  - freshness da assinatura
  - digest HMAC
  - idempotência por `processedWebhookEventIds`
  - retry de atualização de pedido via `withRetry(...)`

### RBAC, sessão e rotas privadas

- `middleware.ts` permanece como ponto de aplicação de:
  - checagem de sessão por rota protegida
  - CSRF same-origin para mutações privadas
  - rate limiting por classe de rota
  - cabeçalhos de privacidade e cache privado
- `auth.ts` continua sendo a definição central de autenticação server-side com credenciais, 2FA e callbacks de sessão.

### Supabase e service role

- Cliente público:
  - `lib/supabase.ts`
  - `lib/supabase/browser.ts`
- Uso server-only de credenciais elevadas:
  - `lib/storage.ts`
  - `lib/storage/supabase-storage-provider.ts`
  - `lib/server-store.ts`
  - `lib/auth-store.ts`
- Políticas RLS mínimas já versionadas e reutilizadas nesta fase:
  - `supabase/migrations/202603011730_storefront_auth_rls.sql`
  - `supabase/migrations/202603011930_quote_items_and_preferences.sql`
  - `supabase/migrations/20260606063633_mdh_storage_rls_policies.sql`

## Tooling e validação

- `scripts/prisma-local-cli.mjs` passou a encapsular `prisma validate`/`prisma generate` com engines locais e fallback de ambiente suficiente para validação offline do schema.
- `scripts/next-build-inline-workers.mjs` executa o build do Next com workers inline no mesmo processo.
  - Motivo real: `next build` nativo falhava neste ambiente Windows gerenciado com `spawn EPERM` e, ao migrar para `worker_threads`, encontrava `DataCloneError`.
  - O wrapper preserva o build do app e mantém `build:next-native` disponível para comparação manual.
- Testes/validadores adicionados ou atualizados:
  - `scripts/test-contracts-v6.mjs`
  - `scripts/test-storefront-images.mjs`
  - `tests/product-availability.spec.ts`
  - `tests/mercadopago-signature.spec.ts`

## Compatibilidade de dados

- Nenhuma migração destrutiva foi adicionada nesta fase.
- Nenhuma tabela, coluna ou dado existente foi removido.
- A consolidação ficou concentrada em política de catálogo, resolução de disponibilidade, checkout/vitrine e validação de build.

## Riscos remanescentes

- `scripts/next-build-inline-workers.mjs` depende de APIs internas de `next/dist`. Se a versão principal do Next mudar, esse wrapper precisa ser revalidado.
- `npm run industrial:v6:verify-build` ainda reprova por um chunk cliente acima de 1,5 MB (`.next/static/chunks/9727-e4db5365464d200f.js` com 3.416.258 bytes na validação local). O indício mais provável é o uso de fontes ricas de catálogo em componentes cliente como `components/combo-builder.tsx`, `components/quick-match-advisor.tsx`, `components/sales-landing-page.tsx`, `components/cart-page-shell.tsx` e `components/checkout/checkout-page-shell.tsx`.
- `test:images` agora é um gate de contrato de assets e catálogo público em Node. O runner visual de navegador foi preservado em `test:images:playwright` para ambientes sem restrição de subprocesso.
- As políticas RLS foram validadas por código, migrações locais e validadores do repositório, mas não foram exercitadas contra um projeto Supabase remoto nesta fase.
- `INDUSTRIAL_BASE_COMMIT` não foi informado durante a verificação industrial local, então a checagem comparativa de migrações contra uma base não pôde ser executada.
