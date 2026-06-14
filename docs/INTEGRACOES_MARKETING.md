# Integracoes de marketing MDH3D

Todas as integracoes sao opcionais. Variavel vazia nao quebra o site.

## GTM

Use:

```env
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
VITE_GTM_ID=GTM-XXXXXXX
```

Eventos enviados ao `dataLayer`:

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

## Meta Pixel

Use:

```env
NEXT_PUBLIC_META_PIXEL_ID=000000000000000
VITE_META_PIXEL_ID=000000000000000
```

Mapeamentos:

- `view_product` -> `ViewContent`
- `search_product` -> `Search`
- `add_to_cart` -> `AddToCart`
- `start_checkout` e `checkout_whatsapp` -> `InitiateCheckout`
- `purchase_lead` -> `Lead`

## TikTok Pixel

Use:

```env
NEXT_PUBLIC_TIKTOK_PIXEL_ID=XXXXXXXXXXXX
VITE_TIKTOK_PIXEL_ID=XXXXXXXXXXXX
```

Mapeamentos:

- `view_product` -> `ViewContent`
- `search_product` -> `Search`
- `add_to_cart` -> `AddToCart`
- `start_checkout` e `checkout_whatsapp` -> `InitiateCheckout`
- `purchase_lead` -> `Contact`

## Feeds

- Google Shopping: `/feeds/google-shopping.xml`
- Meta Commerce: `/feeds/meta-catalog.csv`
- TikTok Catalog: `/feeds/tiktok-catalog.csv`
- JSON operacional: `/feeds/produtos.json`
- Sitemap de produtos: `/sitemap-products.xml`

Os feeds usam somente dados locais do CSV e pulam URLs inseguras como `localhost`, `blob:`, `data:` e `javascript:`.
