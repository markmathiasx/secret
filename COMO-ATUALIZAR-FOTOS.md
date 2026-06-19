# Como Atualizar as Fotos do Catálogo

Hoje a MDH 3D Store usa dois modos de imagem:

- mídia própria/licenciada já validada, mantida como está;
- fallback local de marca para itens ainda sem foto validada, sem usar banco externo de placeholders em produto à venda.

## Onde trocar depois

As imagens entram no catálogo pelo campo `images` de cada produto já normalizado em [D:\mdh-3d-store\lib\catalog.ts](D:/mdh-3d-store/lib/catalog.ts) e pelos helpers em [D:\mdh-3d-store\lib\catalog-media.ts](D:/mdh-3d-store/lib/catalog-media.ts).

Se você quiser substituir o fallback local por mídia própria validada, há três caminhos principais.

## Opção 1: Cloudinary

1. Faça upload das imagens reais para uma pasta como `mdh-3d-store/products`.
2. Pegue as URLs finais do Cloudinary.
3. Troque o `images` do produto para usar essas URLs.
4. Mantenha a primeira imagem como principal.

Exemplo:

```ts
images: [
  "https://res.cloudinary.com/seu-cloud/image/upload/v1/mdh-3d-store/products/grinder-1.jpg",
  "https://res.cloudinary.com/seu-cloud/image/upload/v1/mdh-3d-store/products/grinder-2.jpg",
]
```

## Opção 2: Vercel Blob

1. Envie as fotos para o Blob.
2. Salve as URLs públicas retornadas.
3. Troque o `images` dos produtos pelas URLs finais.

## Opção 3: Pasta local `/public`

1. Coloque as fotos em algo como `public/products/catalogo`.
2. Referencie com caminho absoluto do site, por exemplo:

```ts
images: [
  "/products/catalogo/grinder-1.webp",
  "/products/catalogo/grinder-2.webp",
]
```

## Regra prática

- Mantenha `1200x800` ou melhor para imagem principal.
- Gere também uma variação quadrada quando fizer sentido para miniaturas.
- Continue usando `next/image`.
- Preserve o `alt` descritivo no formato `Impressão 3D de ${title} - MDH 3D Store`.

## Script de apoio

Use somente fotos próprias, renders gerados pela MDH ou mídia com licença comprovada. Banco genérico de imagem não deve ser usado como foto de produto à venda.
