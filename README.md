# MDH – Image pack + mapping

Este pacote contém:

## 1) Imagens
- `public/products/` – imagens em `.webp`
  - **3 fotos reais** já encaixadas em IDs do catálogo (anime-001, anime-014, util-007)
  - **11 fotos reais** (prefixo `foto-xxx-...`) normalizadas (1200×800)
  - **placeholders** gerados automaticamente para completar o pack (mantém o nome final do ficheiro para você substituir depois por fotos reais)

## 2) Mapeamentos
- `planned-product-image-map.json`
  - Mapa `{ productId: "/products/<productId>-<nome>.webp" }`
  - Foi gerado a partir da tabela de nomes de ficheiros do seu anexo (Qwen Chat).
- `product-image-map.json`
  - Mapa gerado a partir dos produtos detectados no trecho do `catalog.ts` que aparece no anexo (útil se o seu código atual ainda tiver menos itens).
- `real-images-manifest.json`
  - Lista das 11 fotos reais incluídas (nomes + etiqueta).

## 3) Script de patch
- `scripts/apply-image-map.mjs`
  - Atualiza `image:` ou o 1º item de `images: [...]` com base num JSON de mapeamento.

---

## Como usar no projeto (Next.js/Vercel)

1) Copie a pasta `public/products/` para dentro do seu projeto:
   - `./public/products/*`

2) Copie um dos mapas para o seu projeto (sugestão: `./scripts/`):
   - `planned-product-image-map.json` **(recomendado para completar o pack)**
   - ou `product-image-map.json` (se quiser apenas os produtos que já estão no `catalog.ts` atual)

3) Rode o patch (Node 18+):
   ```bash
   node ./scripts/apply-image-map.mjs ./src/catalog.ts ./scripts/planned-product-image-map.json
   ```

4) Faça commit e deploy.

> Para ficar “10/10”: substitua cada placeholder por fotografia real do produto e **mantenha exatamente o mesmo nome do arquivo**.
