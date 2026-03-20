# Pacote SD Local para Catálogo (Personagens / Collectibles)

Este pacote foi gerado a partir da validação do catálogo (`CATALOG_VALIDATION_REPORT.json`) e da curadoria de itens geek em `C:\Users\markm\Downloads\geek`, priorizando personagens, chibi e miniaturas colecionáveis.

## Arquivos gerados

- `prompts_batch.json`
- `prompts_batch.csv`
- `export_txt_prompts.py`

## 1) Como usar `prompts_batch.json`

`prompts_batch.json` contém uma lista de prompts prontos, 1 item por imagem, com os campos:

- `id`
- `name`
- `slug`
- `prompt`
- `negative_prompt`
- `seed`
- `width`
- `height`
- `sampler`
- `steps`
- `cfg_scale`
- `output_filename`

Uso típico:

1. Abrir o JSON.
2. Copiar `prompt` e `negative_prompt` de cada item para o AUTOMATIC1111.
3. Aplicar os parâmetros do próprio item (`seed`, `width`, `height`, `sampler`, `steps`, `cfg_scale`).
4. Salvar a saída com o `output_filename` sugerido.

## 2) Como usar `prompts_batch.csv`

`prompts_batch.csv` traz os mesmos dados em formato tabular para:

- revisão comercial rápida;
- edição em planilha;
- importação para fluxos internos.

Colunas:

`id,name,slug,prompt,negative_prompt,seed,width,height,sampler,steps,cfg_scale,output_filename`

## 3) Como importar/copiar prompts no AUTOMATIC1111

Fluxo manual recomendado:

1. Inicie o AUTOMATIC1111 normalmente.
2. Abra `prompts_batch.json` (ou `prompts_batch.csv`).
3. Para cada item:
   - copie `prompt` no campo Prompt.
   - copie `negative_prompt` no campo Negative prompt.
   - configure `seed`.
   - configure `832x1024`.
   - configure `DPM++ 2M Karras`.
   - configure `steps=32`.
   - configure `cfg_scale=6.5`.
4. Gere e salve no nome/caminho de `output_filename`.

## 4) Parâmetros recomendados

Padrão aplicado para consistência:

- Width: `832`
- Height: `1024`
- Sampler: `DPM++ 2M Karras`
- Steps: `32`
- CFG Scale: `6.5`
- Negative prompt base:
  - `text, logo, watermark, packaging, multiple characters, hands, person, cluttered background, low quality, low detail, blurry, cropped, duplicate, extra limbs, deformed, unrealistic face, toy box, dramatic scene`

## 5) Como manter consistência visual

Para preservar visual de catálogo entre todos os personagens:

- mantenha o mesmo checkpoint/modelo para o lote inteiro;
- mantenha o mesmo sampler, dimensões e negative prompt;
- não mude iluminação/câmera entre itens do mesmo batch;
- preserve “single character centered” em todos os renders;
- gere variações por seed apenas quando necessário.

## 6) Recomendação de consistência global (obrigatória)

Use para todo lote:

- mesmo checkpoint;
- mesmo sampler (`DPM++ 2M Karras`);
- mesmas dimensões (`832x1024`);
- mesmo negative prompt base.

Isso reduz drift visual entre cards do catálogo.

## 7) Recomendação opcional (img2img / ControlNet)

Quando quiser aproximar enquadramento das fotos reais:

- use img2img com força baixa/moderada (ex.: 0.25–0.45);
- use ControlNet (lineart/softedge/depth) com referência da foto real;
- preserve o prompt base para não perder o padrão de catálogo.

## Regra de seed determinística

As seeds foram geradas com hash FNV-1a do nome do item (lowercase UTF-8), para reproduzir resultados sem colisões no lote atual:

`seed = 100000 + (fnv1a_32(nome) % 900000000)`

## Associação com pasta de destino (base Downloads\geek)

Os itens seguem a regra do seu diretório:

- prefixo igual = mesmo item;
- sufixo `original` = foto complementar do mesmo item.

Saída sugerida por item no pacote:

- `output_filename = geek/<slug>/<slug>.png`

Assim você consegue manter organização por produto e amarrar facilmente com as fotos reais de:

- `C:\Users\markm\Downloads\geek`

Exemplo:

- item: `Pikachu Pokémon Chibi`
- foto principal: `Pikachu Pokémon Chibi.jpg`
- foto complementar: `Pikachu Pokémon Chibi original.jpg`
- saída SD: `geek/pikachu-pokemon-chibi/pikachu-pokemon-chibi.png`

## Execução automática do mesmo processo

Foi adicionado o script:

- `scripts/generate_geek_catalog_images.py`

Ele executa o lote inteiro assim:

1. Lê `prompts_batch.json`.
2. Tenta gerar por AUTOMATIC1111 (`http://127.0.0.1:7860/sdapi/v1/txt2img`).
3. Se a API local não estiver ativa, usa fallback com as fotos reais de `C:\Users\markm\Downloads\geek`, padronizando para `832x1024`.
4. Salva em:
   - `public/products/geek/<slug>/<slug>.png`
   - `public/products/geek/<slug>/<slug>-original.png` (quando existir `original`).
5. Gera manifesto de associação:
   - `public/products/geek/geek_image_manifest.json`

Comando:

```bash
python scripts/generate_geek_catalog_images.py
```


### Mapa prático (source -> destino)

| Item | Arquivo principal em `Downloads\geek` | Arquivo complementar (`original`) | Destino sugerido |
|---|---|---|---|
| Cavaleiro Medieval Mini | `Cavaleiro Medieval Mini.JPEG` | `Cavaleiro Medieval Mini original.jpeg` | `geek/cavaleiro-medieval-mini/cavaleiro-medieval-mini.png` |
| Coruja Floresta Articulada | `Coruja Floresta Articulada.jpg` | - | `geek/coruja-floresta-articulada/coruja-floresta-articulada.png` |
| Dragão Europeu Mini | `Dragão Europeu Mini.jpg` | - | `geek/dragao-europeu-mini/dragao-europeu-mini.png` |
| Dragão Oriental Articulado | `Dragão Oriental Articulado.jpg` | - | `geek/dragao-oriental-articulado/dragao-oriental-articulado.png` |
| Elsa Frozen Chibi | `Elsa Frozen Chibi.jpg` | `Elsa Frozen Chibi original.jpg` | `geek/elsa-frozen-chibi/elsa-frozen-chibi.png` |
| Foguete Espacial Mini | `Foguete Espacial Mini.png` | `Foguete Espacial Mini original.jpg` | `geek/foguete-espacial-mini/foguete-espacial-mini.png` |
| Goku Dragon Ball Chibi | `Goku Dragon Ball Chibi.png` | `Goku Dragon Ball Chibi original.jpg` | `geek/goku-dragon-ball-chibi/goku-dragon-ball-chibi.png` |
| Kirby Nintendo Chibi | `Kirby Nintendo Chibi.png` | `Kirby Nintendo Chibi original.gif` | `geek/kirby-nintendo-chibi/kirby-nintendo-chibi.png` |
| Luffy One Piece Chibi | `Luffy One Piece Chibi.png` | `Luffy One Piece Chibi original.gif` | `geek/luffy-one-piece-chibi/luffy-one-piece-chibi.png` |
| Mario Nintendo Chibi | `Mario Nintendo Chibi.jpg` | `Mario Nintendo Chibi original.jpg` | `geek/mario-nintendo-chibi/mario-nintendo-chibi.png` |
| Pikachu Pokémon Chibi | `Pikachu Pokémon Chibi.jpg` | `Pikachu Pokémon Chibi original.jpg` | `geek/pikachu-pokemon-chibi/pikachu-pokemon-chibi.png` |
| Polvo Oceano Articulado | `Polvo Oceano Articulado.jpg` | `Polvo Oceano Articulado original.jpg` | `geek/polvo-oceano-articulado/polvo-oceano-articulado.png` |
| Sasuke Uchiha Chibi | `Sasuke Uchiha Chibi.png` | - | `geek/sasuke-uchiha-chibi/sasuke-uchiha-chibi.png` |
| Sonic Hedgehog Chibi | `Sonic Hedgehog Chibi.jpg` | `Sonic Hedgehog Chibi original.jpg` | `geek/sonic-hedgehog-chibi/sonic-hedgehog-chibi.png` |
| Totoro My Neighbor Chibi | `Totoro My Neighbor Chibi.jpg` | `Totoro My Neighbor Chibi original.jpg` | `geek/totoro-my-neighbor-chibi/totoro-my-neighbor-chibi.png` |
| Tubarão Oceano Mini | `Tubarão Oceano Mini.jpg` | - | `geek/tubarao-oceano-mini/tubarao-oceano-mini.png` |
