# Loja inteligente MDH3D

Esta implementação usa integração local. A Nuvemshop é apenas checkout externo quando o produto tiver link no CSV. Não há chamada de API, token, senha ou credencial da Nuvemshop no código.

## Editar `data/produtos.csv`

O site lê `data/produtos.csv` no build/SSR. O delimitador pode ser `;` ou `,`, com campos entre aspas.

Campos esperados:

- `Identificador URL`: slug do produto, por exemplo `chaveiro-flamengo-3d`.
- `Nome`: nome público.
- `Categorias`: categoria da loja.
- `Preço`: preço cheio ou cartão.
- `Preço promocional`: usado como Pix quando menor que `Preço`.
- `Custo de produção`: custo base estimado da peça. Quando preenchido, o site usa este valor para recalcular o Pix.
- `Custo do filamento/kg`: referência do custo do rolo de filamento em reais por kg. O fallback atual é `100`.
- `Lucro (%)`: markup aplicado sobre o custo de produção. A regra atual é `30`.
- `Peso (kg)`, `Altura (cm)`, `Largura (cm)`, `Comprimento (cm)`.
- `Estoque`.
- `SKU`.
- `Descrição`.
- `Tags`: separadas por vírgula, ponto e vírgula ou `|`.
- `Título para SEO`.
- `Descrição para SEO`.
- `Marca`.
- `Produto Físico`.
- `Link Nuvemshop`: opcional.
- `Imagem`: opcional, pode ser `/catalog-assets/...` ou URL `https://`.
- Campos opcionais extras: `Material`, `Cores`, `Personalizável`, `Prazo de produção`, `Galeria` e `Vídeo`.

## Adicionar link da Nuvemshop

Use a coluna `Link Nuvemshop`.

Opções:

- URL absoluta: `https://sua-loja.com.br/produtos/produto-x`.
- Caminho relativo: `/produtos/produto-x`.

Quando usar caminho relativo, configure a base:

```env
VITE_NUVEMSHOP_BASE_URL=https://sua-loja.com.br
```

Se o produto não tiver link válido, o botão principal abre WhatsApp com mensagem automática.

## Configurar WhatsApp

```env
VITE_WHATSAPP_NUMBER=5521974137662
```

Fallback seguro: se a variável estiver vazia, o site usa o número oficial já cadastrado no projeto.

## Configurar GTM

```env
VITE_GTM_ID=GTM-XXXXXXX
```

Se `VITE_GTM_ID` estiver vazio, o site não carrega GTM e não quebra. Os eventos continuam sendo empurrados para `window.dataLayer` quando houver navegador.

Eventos:

- `view_category`
- `view_product`
- `search_product`
- `filter_product`
- `add_to_cart`
- `remove_from_cart`
- `click_buy_nuvemshop`
- `click_whatsapp_budget`
- `start_checkout`
- `checkout_whatsapp`
- `purchase_lead`
- `coupon_apply`
- `share_product`

## Configurar Meta Pixel

```env
VITE_META_PIXEL_ID=000000000000000
```

Se estiver vazio, o pixel não carrega.

Eventos mapeados:

- `ViewContent`
- `Search`
- `AddToCart`
- `InitiateCheckout`
- `Lead`

## Configurar TikTok Pixel

```env
NEXT_PUBLIC_TIKTOK_PIXEL_ID=XXXXXXXXXXXX
VITE_TIKTOK_PIXEL_ID=XXXXXXXXXXXX
```

Se estiver vazio, o pixel não carrega. Os eventos seguem o mesmo fluxo seguro do GTM/Meta.

## Feeds

Google Shopping:

```text
/feeds/google-shopping.xml
```

Meta:

```text
/feeds/meta-catalog.csv
```

JSON interno:

```text
/feeds/produtos.json
```

TikTok:

```text
/feeds/tiktok-catalog.csv
```

Sitemap de produtos:

```text
/sitemap-products.xml
```

Os feeds usam os produtos locais do CSV com preço, disponibilidade, descrição, link de produto no site e imagem quando existir.

## Preço por custo de produção

A loja inteligente usa a regra comercial atual:

```text
Pix = custo de produção x 1,30
Cartão = Pix + R$ 1,00
```

O custo do filamento por kg pode ser configurado com `MDH_FILAMENT_PRICE_PER_KG` ou `VITE_MDH_FILAMENT_PRICE_PER_KG`. O fallback é R$ 100/kg, uma referência conservadora para PLA comum/premium no Brasil.

## Ofertas e orçamento

- `/ofertas`: cupons locais, combo leve 3 pague 2 e vitrines por faixa de preço.
- `/orcamento-personalizado`: formulário com cálculo inicial, validação de extensões e WhatsApp com briefing completo.

## Expansão Copa e temas populares

A vitrine agora inclui `data/copa-theme-expansion-300.json`, com 300 SKUs adicionais e imagens próprias em `/products/copa-theme-expansion/`.

- 130 itens de Copa/futebol: chaveiros, troféus, decoração e utilidades de jogo.
- 170 itens de temas diversos: setup gamer, organização, presentes, geek neutro, pets e kids.
- Todos usam Pix = custo estimado + 30% e cartão = Pix + R$ 1.
- As imagens são geradas localmente para a MDH3D e não usam logo oficial de Copa/FIFA ou arte protegida.

STLFlix: a pesquisa pública indica que a plataforma é uma biblioteca por assinatura com milhares de STLs e licença comercial para assinantes. O projeto não baixa nem replica STL privado sem credencial/licença. Quando houver arquivos licenciados, cadastre o produto no CSV/JSON com imagem própria e mantenha a prova de licença fora do repositório.

## O que ainda depende do painel da Nuvemshop

- Criar os produtos reais no painel.
- Publicar estoque/preço final no checkout externo.
- Copiar o link do produto para `Link Nuvemshop`.
- Configurar meios de pagamento, frete e políticas dentro da Nuvemshop.
- Configurar domínio/base URL e colocar em `VITE_NUVEMSHOP_BASE_URL` quando usar caminhos relativos.
