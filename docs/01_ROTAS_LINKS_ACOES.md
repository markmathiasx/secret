# 01 Rotas, Links e Acoes

## Rotas publicas principais

| Rota | Arquivo | Status |
| --- | --- | --- |
| / | app/page.tsx | Ativa |
| /loja | app/loja/page.tsx | Ativa |
| /ofertas | app/ofertas/page.tsx | Ativa |
| /catalogo | app/catalogo/page.tsx | Ativa |
| /sob-medida | app/sob-medida/page.tsx | Ativa |
| /produto/[slug] | app/produto/[slug]/page.tsx | Ativa |
| /loja/[categoria]/[slug] | app/loja/[categoria]/[slug]/page.tsx | Ativa |
| /carrinho | app/carrinho/page.tsx | Ativa |
| /checkout | app/checkout/page.tsx | Ativa |
| /pedidos | app/pedidos/page.tsx | Ativa |
| /atendimento | app/atendimento/page.tsx | Ativa |
| /jogue | app/jogue/page.tsx | Ativa, 11 jogos |
| /como-funciona | app/como-funciona/page.tsx | Ativa |
| /blog | app/blog/page.tsx | Ativa |

## Rotas institucionais obrigatorias

| Rota | Arquivo | Status |
| --- | --- | --- |
| /comprar-na-mdh3d | app/comprar-na-mdh3d/page.tsx | Ativa |
| /politica-de-envio | app/politica-de-envio/page.tsx | Ativa |
| /politica-de-troca | app/politica-de-troca/page.tsx | Ativa |
| /politica-de-privacidade | app/politica-de-privacidade/page.tsx | Ativa |
| /termos-de-compra | app/termos-de-compra/page.tsx | Ativa |
| /prazo-de-producao | app/prazo-de-producao/page.tsx | Ativa |

## APIs criticas

| API | Arquivo | Status |
| --- | --- | --- |
| /api/cart | app/api/cart/route.ts | Ativa |
| /api/orders | app/api/orders/route.ts | Ativa |
| /api/checkout/preference | app/api/checkout/preference/route.ts | Ativa |
| /api/support/chat | app/api/support/chat/route.ts | Ativa |
| /api/catalog/search | app/api/catalog/search/route.ts | Ativa |
| /api/catalog/health | app/api/catalog/health/route.ts | Ativa |
| /api/admin/* | app/api/admin/* | Protegidas segundo security:audit |

## Feeds

| Feed | Arquivo | Validacao |
| --- | --- | --- |
| /meta/catalog.csv | app/meta/catalog.csv/route.ts | Catálogo público ativo, inválidos ignorados com relatório |
| /feeds/meta-catalog.csv | app/feeds/meta-catalog.csv/route.ts | Ativo |
| /feeds/google-shopping.xml | app/feeds/google-shopping.xml/route.ts | Ativo |
| /feeds/google-shopping.csv | app/feeds/google-shopping.csv/route.ts | Ativo |
| /feeds/produtos.json | app/feeds/produtos.json/route.ts | Ativo |
| /feeds/products.json | app/feeds/products.json/route.ts | Ativo |
| /merchant/products.xml | app/merchant/products.xml/route.ts | Ativo |

## Acoes comerciais observadas

| Acao | Evidencia | Status |
| --- | --- | --- |
| Comprar produto smart com Nuvemshop quando houver URL | lib/mdh-store/links.ts e SmartProductActions | Ativo |
| Produto sem URL abre WhatsApp | buildWhatsappUrl() | Ativo |
| Carrinho local smart finaliza pelo WhatsApp | buildCartWhatsappUrl() | Ativo |
| Carrinho principal adiciona/remove/altera quantidade | lib/cart-context.tsx e app/carrinho/page.tsx | Ativo |
| Suporte responde com produtos reais | support:validate, 843 públicos ativos indexados | Ativo |
| Botao jogo permanece isolado | /jogue validado com 11 jogos | Ativo |

## Ajuste aplicado nesta fase

Foi criada a configuracao central `src/config/navigation.ts` e header/footer passaram a consumir `primaryNavigationLinks`. O menu oficial e: Loja, Ofertas, Catálogo, Sob medida, Jogue, Como funciona, Blog, Atendimento.
