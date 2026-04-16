# Patch comercial: vitrine real-first

Este pacote não é o repositório inteiro. Ele traz os arquivos que eu alteraria primeiro para o site ficar mais vendável hoje, sem deixar imagem conceitual dominar a vitrine.

## O que muda

- `app/page.tsx`
  - home puxando apenas itens com foto real na vitrine principal
  - texto mais direto para venda
  - menos risco de parecer catálogo em construção

- `app/catalogo/page.tsx`
  - catálogo abre em `mode=real` por padrão
  - foco inicial em foto real
  - filtros continuam permitindo `verified` e `all`

- `scripts/import-real-photos.mjs`
  - importa fotos em lote de `input/real-photos`
  - converte para `webp`
  - cria capa em `public/products/catalog/<id>.webp`
  - cria galeria em `public/products/gallery/<id>/<nn>.webp`
  - atualiza `data/catalog-photo-manifest.json`
  - gera relatório em `reports/import-real-photos-report.json`

- `package.json`
  - adiciona `npm run catalog:import-real`

## Como usar hoje

1. Copie estes arquivos por cima dos arquivos do projeto.
2. Coloque suas fotos reais em `input/real-photos`.
3. Nomeie os arquivos com o id do produto no nome, por exemplo:
   - `mdh-050.jpg`
   - `mdh-050-2.jpg`
   - `mdh-051-1.png`
4. Rode:
   - `npm install`
   - `npm run catalog:import-real`
   - `npm run build`

## Observação importante

Esse patch melhora a frente comercial do site e elimina a dependência de troca manual uma a uma para as próximas fotos reais.

Ele **não inventa 170 fotos reais**. O ganho imediato vem de:
- vender primeiro o que já tem foto real
- parar de expor imagem errada como primeira impressão
- facilitar importação em lote do restante
