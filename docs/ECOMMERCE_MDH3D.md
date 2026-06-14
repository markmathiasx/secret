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

- `view_product`
- `search_product`
- `add_to_cart`
- `click_buy_nuvemshop`
- `click_whatsapp_budget`
- `checkout_whatsapp`

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

Os feeds usam os produtos locais do CSV com preço, disponibilidade, descrição, link de produto no site e imagem quando existir.

## O que ainda depende do painel da Nuvemshop

- Criar os produtos reais no painel.
- Publicar estoque/preço final no checkout externo.
- Copiar o link do produto para `Link Nuvemshop`.
- Configurar meios de pagamento, frete e políticas dentro da Nuvemshop.
- Configurar domínio/base URL e colocar em `VITE_NUVEMSHOP_BASE_URL` quando usar caminhos relativos.
