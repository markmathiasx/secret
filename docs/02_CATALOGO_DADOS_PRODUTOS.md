# 02 Catalogo e Dados de Produtos

## Fontes atuais

| Fonte | Arquivo/modulo | Quantidade atual | Observacao |
| --- | --- | ---: | --- |
| Catalogo publico | lib/catalog.ts + lib/catalog-repository.ts | 848 | Usado por /catalogo, suporte e feed Meta principal |
| Loja inteligente | data/produtos.csv + data/copa-theme-expansion-300.json + lib/mdh-store/products.ts | 306 | Usado por /loja e /produto/[slug] |
| Feed Meta principal | lib/meta-commerce-feed.ts | 844 | 4 produtos pulados por imagem publica ausente |
| Reviews/questions loja | data/mdh-store-reviews.json e data/mdh-store-questions.json | Dados locais | Usados na PDP smart store |

## Validacoes recentes

| Relatorio | Resultado |
| --- | --- |
| reports/public-regressions-validation-report.json | 848 produtos, 11 jogos, ok |
| reports/meta-commerce-feed-report.json | 844 produtos no feed, 4 ignorados, ok |
| reports/pricing-validation-report.json | 848 produtos, sem issues de preco |
| reports/marketplace-catalog-integrity-report.json | 848 publicos + 306 smart, sem duplicate public slug, sem Picsum |
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
| 4 produtos fora do feed Meta por imagem publica ausente | Feed Meta 844 em vez de 848 | Curadoria de imagem publica para mdh-067, mdh-068, mdh-069, csv-uti-040 |
| Smart store tem 306 produtos alem dos 848 publicos | Contagem total depende do contexto | Expor health unificado e decidir se unifica ou mantem separado |
| GenericDescriptionCount 43 no relatorio marketplace | Copy ainda pode melhorar | Curadoria de descricao sem alterar dados sensiveis |
