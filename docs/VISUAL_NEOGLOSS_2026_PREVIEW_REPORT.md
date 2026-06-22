# Visual NeoGlass 2026 Preview Report

## Escopo

Preview isolado em `/preview/neoglass-2026` para a direção visual **MDH3D NeoGlass Commerce OS 2026**.

Esta entrega não publica tema global, não altera preços, não altera o catálogo funcional, não altera feeds existentes, não altera WhatsApp, não altera `/jogue` e não altera o score Commerce OS.

## Arquivos criados ou alterados

- `app/preview/neoglass-2026/page.tsx`
- `app/preview/neoglass-2026/preview-neoglass-client.tsx`
- `src/styles/neoglass-preview.css`
- `src/components/preview/neoglass/types.ts`
- `src/components/preview/neoglass/NeoGlassPreviewShell.tsx`
- `src/components/preview/neoglass/NeoGlassHeaderPreview.tsx`
- `src/components/preview/neoglass/Hero3DShowcasePreview.tsx`
- `src/components/preview/neoglass/NeonSearchPreview.tsx`
- `src/components/preview/neoglass/DropRailPreview.tsx`
- `src/components/preview/neoglass/ProductGlassCardPreview.tsx`
- `src/components/preview/neoglass/CinematicProductPreview.tsx`
- `src/components/preview/neoglass/QuoteConfiguratorPreview.tsx`
- `src/components/preview/neoglass/AdminCommandCenterPreview.tsx`
- `src/components/preview/neoglass/MobileNeonPreview.tsx`
- `tests/e2e/neoglass-preview.spec.ts`
- `playwright.config.ts`
- `app/layout.tsx`

## Paleta visual

- Base: `#030712`, painéis glass `rgba(10, 18, 32, 0.72)`.
- Neon primário: cyan `#67e8f9`, blue `#60a5fa`, violet `#a78bfa`, pink `#f472b6`.
- Acentos operacionais: green `#86efac`, amber `#fbbf24`.
- Raio de cards mantido em `8px` para respeitar o sistema visual e evitar excesso decorativo.

## Seções implementadas

- Header NeoGlass com logo, menu oficial e CTAs `Orçar no WhatsApp` e `Ver catálogo`.
- Hero premium com "MDH3D Commerce OS 2026", métricas e cards Product Master, PriceOps e ChannelOps.
- Busca marketplace com input grande, chips de categoria e contador de resultados.
- Catálogo neon com produtos reais, imagem, nome, SKU, Pix, cartão, badges, Comprar e WhatsApp.
- Rails STLFLIX: Drops da semana, Presentes até R$50, Geek e gamer, Casa organizada, Sob medida.
- Simulação cinematográfica de página de produto com produto real.
- 3D Lab Configurator visual, sem upload real.
- Admin Command Center com métricas operacionais exigidas.
- Mockup mobile com busca sticky, cards compactos, carrinho visual, bottom menu e WhatsApp.
- Tabela Antes/depois confirmando que é preview isolado.

## Dados usados

- Catálogo público: `getCatalogSnapshot()`.
- Métricas públicas: `buildPublicCatalogStats()`.
- Imagens públicas: `getPrimaryProductImage()` e `getProductImageAlt()`.
- Feed Meta: `buildMetaCommerceFeedData()`.
- Smart store / Google feed visual: `getLocalStoreProducts()`.
- WhatsApp oficial: `5521974137662`.

## Garantias de não regressão

- Nenhum arquivo de preço foi alterado.
- Nenhum arquivo de catálogo funcional foi alterado.
- Nenhuma rota de feed foi alterada.
- Nenhuma rota de checkout foi alterada.
- Nenhuma rota de jogo foi alterada.
- O preview está fora do sitemap e usa metadata `noindex`.
- CSS escopado em `.neoglass-preview`; header/footer atuais são ocultos somente nessa rota via `body:has(.neoglass-preview)`.

## Validações

- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS. Rota `/preview/neoglass-2026` gerada no build Next com revalidate de 5 minutos.
- `npm test`: PASS. Resultado final: 69 passed, 7 skipped.
- `npx playwright test`: PASS. Resultado final: 69 passed, 7 skipped.
- `npm run commerce-os:score`: PASS. Score mantido em `100/100/100`.
- `PRODUCTION_VALIDATE_BASE_URL=http://127.0.0.1:3000 node scripts/validate-production-public.ts`: PASS local em rotas públicas e feeds cobertos.

Observação local: os testes Playwright foram executados com `PLAYWRIGHT_USE_SYSTEM_CHROME=1` porque o Chromium gerenciado não estava instalado no perfil local. Segredos de sessão usados nos testes foram valores dummy definidos somente no processo, sem escrita em `.env`.

## Screenshots

Playwright está configurado para screenshot apenas em falha. A execução final passou sem screenshots novos de falha para commit.

## Próximos passos para tema global

Para transformar este preview em tema global, criar uma feature flag explícita, validar Lighthouse/axe nas rotas principais, comparar conversão por sessão e só então mover componentes para o layout real. O preview atual não deve ser promovido automaticamente.
