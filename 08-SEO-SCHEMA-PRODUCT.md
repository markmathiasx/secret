# SEO — Product schema

## Objetivo
Melhorar entendimento do produto em busca orgânica.

## JSON-LD base
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Luminária LED Personalizada de Mesa",
  "image": [
    "https://seusite.com/imagens/luminaria-led-01.jpg"
  ],
  "description": "Peça 3D personalizada para decoração e presente.",
  "brand": {
    "@type": "Brand",
    "name": "MDH 3D"
  },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "BRL",
    "price": "89.90",
    "availability": "https://schema.org/InStock",
    "url": "https://seusite.com/catalogo/luminaria-led-personalizada"
  }
}
```

## Campos que valem ouro
- name
- image
- description
- brand
- offers.price
- offers.availability
- url

## Complementos recomendados
- review
- aggregateRating
- shippingDetails
- hasMerchantReturnPolicy
