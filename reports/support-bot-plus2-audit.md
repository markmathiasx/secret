# Auditoria suporte + precificacao +R$2

Gerado em: 2026-06-04

1. Commit atual antes da implementacao: `ad800c6`.
2. Quantidade atual de produtos no catalogo: `564`.
3. Arquivos de preco revisados: `lib/payment-pricing.ts`, `lib/pricing-engine.ts`, `lib/catalog-pricing-policy.ts`, `lib/catalog.ts`, `scripts/catalog/validate-card-prices.mjs`, `scripts/catalog/validate-pricing.mjs`, `lib/meta-commerce-feed.ts`.
4. Arquivos de catalogo revisados: `lib/catalog.ts`, `lib/verified-catalog.ts`, `lib/catalog-csv-curated.ts`, `lib/a1-mini-expansion-catalog.ts`, `data/admin-product-overrides.json`, `data/products.json`.
5. Arquivos de atendimento revisados: `app/atendimento/page.tsx`, `components/commerce-assistant-dialog.tsx`, `components/live-chat-widget.tsx`, `components/site-assistant.tsx`.
6. Rotas API de atendimento existentes/revisadas: `app/api/chat/route.ts`, `app/api/assistant/chat/route.ts`; novas rotas exigidas: `app/api/support/chat/route.ts`, `app/api/support/search-products/route.ts`.
7. Chatbot global existente: sim, `components/commerce-assistant-dialog.tsx` e `components/live-chat-widget.tsx`.
8. `/atendimento` estatico antes da mudanca: sim; pagina client-side com respostas simuladas e telefone generico.
9. Bot anterior usava catalogo real: nao no `/atendimento`; as respostas eram simuladas localmente.
10. Termos proibidos encontrados antes da limpeza em area publica: telefone generico `(21) 99999-9999` em checkout/atendimento, telefone `+55 21 99999-9999` em erro de pagamento, schema e SEO; sanitizadores ja cobriam termos de imagem/copy antiga.
11. Exemplos de 5 produtos com preco-base antes do +R$2:
    - `real-001` Grinder 3 Partes Premium: Pix base R$ 11,00; novo Pix R$ 13,00; cartao R$ 14,00.
    - `real-002` Porta Creme Dental de Bancada: Pix base R$ 7,32; novo Pix R$ 9,32; cartao R$ 10,32.
    - `real-003` Demogorgon Decorativo Premium: Pix base R$ 16,51; novo Pix R$ 18,51; cartao R$ 19,51.
    - `real-004` mascote temática Jedi Colecionável: Pix base R$ 11,00; novo Pix R$ 13,00; cartao R$ 14,00.
    - `real-005` Stencil dupla sci-fi Decorativo: Pix base R$ 18,35; novo Pix R$ 20,35; cartao R$ 21,35.
12. Estado atual de `/jogue`: `components/games/ArcadeHub.tsx` monta 11 experiencias ativas: `Pinball Star`, `Print Runner 3D` e 9 mini-games de `miniGameCatalog`; `GameKeyboardGuard`, `PinballStar` e `PrintRunner` previnem rolagem pela tecla espaco durante o jogo.
13. Estado atual do feed Meta: rota de feed existe em `app/merchant/products.xml/route.ts`; validacao final sera feita por `npm run meta:validate-feed` e leitura publica do CSV/endpoint disponivel.
