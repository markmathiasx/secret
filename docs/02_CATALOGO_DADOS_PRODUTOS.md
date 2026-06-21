# 02 Catalogo e Dados de Produtos

## Fontes atuais

| Fonte | Arquivo/modulo | Quantidade atual | Observacao |
| --- | --- | ---: | --- |
| Catalogo bruto | lib/catalog.ts | 848 | Fonte interna antes do filtro público |
| Catalogo publico ativo | lib/catalog-repository.ts + src/lib/catalog/stats.ts | 843 | Usado por /, /catalogo, /atendimento, suporte e feed Meta principal |
| Loja inteligente | data/produtos.csv + data/copa-theme-expansion-300.json + lib/mdh-store/products.ts | 306 | Usado por /loja e /produto/[slug] |
| Feed Meta principal | lib/meta-commerce-feed.ts | Derivado dos 843 públicos ativos | Produtos invalidos sao ignorados com motivo |
| Reviews/questions loja | data/mdh-store-reviews.json e data/mdh-store-questions.json | Dados locais | Usados na PDP smart store |

## Validacoes recentes

| Relatorio | Resultado |
| --- | --- |
| reports/public-regressions-validation-report.json | 843 produtos públicos ativos, 11 jogos, ok |
| reports/meta-commerce-feed-report.json | Feed público válido, ignorados com motivo, ok |
| reports/pricing-validation-report.json | 848 produtos, sem issues de preco |
| reports/marketplace-catalog-integrity-report.json | Catálogo bruto + 306 smart, sem duplicate public slug, sem Picsum |
| reports/marketplace-ip-risk-report.json | 0 achados |

## Product Master Data

Adicionado nesta fase:

- `data/catalog/product-master-contract.json`
- `src/lib/catalog/types.ts`
- `src/lib/catalog/normalize.ts`
- `src/lib/catalog/repository.ts`
- `src/lib/catalog/index.ts`

O Product Master e uma fachada canonica de leitura, sem mutacao automatica. Ele normaliza:

| Campo canonico | Origem catalogo publico | Origem smart store |
| --- | --- | --- |
| slug | product.slug ou slugify(name) | product.slug |
| sku | product.sku | product.sku |
| pricePix | product.pricePix | product.pixPrice |
| priceCard | calculado por payment-pricing Pix + R$ 1 | calculado por payment-pricing Pix + R$ 1 |
| productUrl | getProductUrl(product) | /produto/[slug] |
| nuvemshopUrl | ausente | opcional |
| whatsappEligible | true | true quando nao existe nuvemshopUrl |

## Problemas ainda existentes

| Problema | Impacto | Proxima acao |
| --- | --- | --- |
| Duas superficies de produto convivem: /catalogo e /loja | Pode confundir contagem e score | Migracao gradual para Product Master em APIs/health |
| Produtos fora do feed Meta por imagem publica ausente | Feed Meta menor que catálogo público ativo quando necessário | Curadoria de imagem publica para itens ignorados |
| Smart store tem 306 produtos alem do catálogo público ativo | Contagem total depende do contexto | Expor health unificado e manter rótulo explícito por superfície |
| GenericDescriptionCount 43 no relatorio marketplace | Copy ainda pode melhorar | Curadoria de descricao sem alterar dados sensiveis |
