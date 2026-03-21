# Pacote SD Local - MDH 3D Store

## Arquivos
- `prompts_batch.json`: lote principal para automacao local e integracoes.
- `prompts_batch.csv`: mesma base em formato planilha.
- `export_txt_prompts.py`: exporta um `.txt` por item em `prompts_txt/`.

## Como usar o JSON
1. Abra `prompts_batch.json`.
2. Cada objeto ja traz prompt, negative prompt, seed, sampler, resolucao e nome de saida.
3. Use cada item em `txt2img` ou `img2img` no AUTOMATIC1111.

## Como usar o CSV
- Use `prompts_batch.csv` para revisar em Excel, Google Sheets ou filtrar lotes por personagem.
- As colunas batem 1:1 com o JSON.

## AUTOMATIC1111
- Instancia local validada: `D:\pinokio\api\sd-webui.pinokio.git\automatic1111`.
- Porta validada para a API local: `7861`.
- Checkpoint recomendado: `juggernautXL_ragnarokBy.safetensors`.
- Caminho do checkpoint: `D:\sd-models\Stable-diffusion\juggernautXL_ragnarokBy.safetensors`.
- Sampler recomendado: `DPM++ 2M Karras`.
- Dimensoes recomendadas: `832x1024`.
- Steps: `32`.
- CFG Scale: `6.5`.
- Negative prompt: manter o mesmo em toda a serie.

## Fluxo sugerido
1. Inicie o A1111 do Pinokio em `D:\pinokio\api\sd-webui.pinokio.git\automatic1111`.
2. Use a API local em `http://127.0.0.1:7861`.
3. Confirme que o modelo ativo e o `juggernautXL_ragnarokBy.safetensors`.
4. Se ja existir uma imagem base fiel do item, use `img2img` com denoising entre `0.35` e `0.55`.
5. Se nao existir referencia, use `txt2img` com a seed do lote.
6. Salve no padrao de nome do proprio item dentro de `D:\mdh-3d-store\output\geek`.

## Consistencia visual
- Mantenha o mesmo checkpoint, sampler, dimensoes, steps e CFG em todos os itens.
- Nao troque o negative prompt entre personagens da mesma serie.
- Preserve o look de foto real de produto: madeira, workshop desfocado, impressora 3D ao fundo, camada visivel de PLA premium.
- Para personagens chibi, mantenha cabeca maior e proporcao de mini colecionavel.
- Para Minecraft, mantenha geometria cubica fiel ao jogo.

## MakerWorld / catalogo local
- Priorize enquadramento limpo, item centralizado e um unico sujeito por imagem.
- Evite cenarios elaborados, textos promocionais e props extras fora da propria miniatura.

## Opcional
- Use `img2img` para aproximar o enquadramento de uma foto real ja existente.
- Use ControlNet Reference/IP-Adapter somente se precisar travar melhor silhueta e pose sem perder o look fotografico.

## Seed deterministica
- A seed foi gerada por hash FNV-1a do nome do item, normalizado para minusculas sem acentos.
- Se houver colisao, o lote incrementa a seed ate ficar unica.
