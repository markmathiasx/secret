# Fase 14 - Auditoria visual antes de editar

Data: 2026-06-19  
Branch inicial: codex/marketplace-phase0-protocol  
Branch de trabalho: codex/visual-fase14-cinematic  
Commit auditado: 3b8ed4bf04a56bf8f1788ddc2e6d59b338d0eddf

## Evidencias capturadas

| Evidencia | Arquivo | Resultado |
| --- | --- | --- |
| HTML completo da home em producao | `reports/visual-audit/home-before.html` | HTTP 200 |
| Screenshot home | `reports/visual-audit/home-before.png` | capturado |
| Screenshot catalogo | `reports/visual-audit/catalog-before.png` | capturado |
| Screenshot sobre | `reports/visual-audit/about-before.png` | capturado |
| Screenshot contato | `reports/visual-audit/contact-before.png` | capturado |
| Lighthouse home antes | `reports/visual-audit/lighthouse-home-before.json` | Perf 85, A11y 96, BP 100, SEO 100 |
| Secoes duplicadas | `reports/visual-audit/duplicate-sections.txt` | `Compra rapida` aparece em home/catalogo |
| Carrosseis | `reports/visual-audit/all-carousels.txt` | `RotatingProductHero` usa carrossel |

## Duplicacoes confirmadas

| Item | Evidencia | Impacto |
| --- | --- | --- |
| `quickBlocks` duplica a intencao de compra de `IntentShoppingSection` | `app/page.tsx`, `components/commerce/IntentShoppingSection.tsx` | Home repete o mesmo papel comercial |
| Hero e "Mais pedidos" podem repetir produtos | selecao independente em `app/page.tsx` e `BestSellersSection` | Produto aparece mais de uma vez acima da dobra |
| Tres `ProductRail`s nao deduplicam entre si | filtros independentes em `app/page.tsx` | Repeticao de cards e leitura de vitrine menos premium |
| Bloco "Sob medida" reaproveita `custom.slice(0, 4)` | `app/page.tsx` | Produtos ja exibidos podem voltar no fim da home |
| Rotulo "Compra rapida" aparece em varias superficies | `duplicate-sections.txt` | Sensacao de template repetido |

## Produtos repetidos simulados pela logica atual

| Produto | Aparece em |
| --- | --- |
| `mdh-016` Chaveiro Personalizado | hero, bestSellers |
| `mw-a1-452` Tag para Pet Compacto | bestSellers, entry |
| `mdh-015` Suporte para Celular | bestSellers, homeSetup, geek |
| `real-002` Porta Creme Dental de Bancada | bestSellers, homeSetup, custom |
| `mdh-017` Suporte para Controle PS5 | bestSellers, homeSetup |
| `mdh-019` Porta-Copos Geek | bestSellers, homeSetup |
| `real-006` Familia Customizada em Miniatura | bestSellers, geek |
| `real-001` Grinder 3 Partes Premium | homeSetup, custom |
| `mdh-013` Suporte para Fone Headphone | homeSetup, geek |
| `mdh-014` Organizador de Cabos | homeSetup, geek |
| `real-003` Demogorgon Decorativo Premium | geek, custom |
| `real-004` mascote tematica Jedi Colecionavel | geek, custom |

## Riscos de credibilidade

| Risco | Evidencia | Acao esperada |
| --- | --- | --- |
| CNPJ nao encontrado como dado publico | busca por `CNPJ/cnpj` so achou sanitizacao/loggers | Nao inventar CNPJ; expor somente se houver valor real em env publica |
| Prova social simulada em PDP | `components/product-social-proof.tsx` usa viewers simulados | Remover/neutralizar numeros ao vivo simulados |
| Urgencia latente nao importada | `components/urgency-triggers.tsx` tem "acabou de comprar" e "#1 Mais vendido" | Neutralizar para evitar uso futuro enganoso |
| Docs/seed ainda citam Picsum/Unsplash | `COMO-ATUALIZAR-FOTOS.md`, `README.md`, `prisma/seed.ts` | Remover promessa de placeholder externo para produto a venda |
| Placeholder local ainda existe como fallback | `product-card.svg` e snapshot com itens placeholder | Manter fallback local com aviso visual, sem fingir foto real |

## Declaracao registrada

```text
[DECLARACAO FASE 14]
- Li o HTML atual da home (commit hash: 3b8ed4bf04a56bf8f1788ddc2e6d59b338d0eddf)
- Identifiquei 5 secoes/fluxos duplicados: quickBlocks duplicando IntentShoppingSection, hero repetindo produtos de "Mais pedidos", 3 ProductRails independentes sem dedupe, bloco "Sob medida" reaproveitando produtos ja exibidos, rotulo "Compra rapida" repetido em home/catalogo
- Identifiquei 7 componentes/areas visuais inconsistentes: HomeProductCard vs card de BestSellers, ProductRail repetido, RotatingProductHero com carrossel e produtos duplicaveis, footer com raio visual diferente, CatalogExplorer com raio visual diferente, StorefrontSalesShelves legado nao usado, urgency/social proof com risco de simulacao
- Entendo que NAO posso usar placeholder Picsum/Unsplash
- Entendo que cada mudanca precisa de commit com mensagem descritiva
- Entendo que o relatorio final em % sem evidencia = tarefa rejeitada
```

