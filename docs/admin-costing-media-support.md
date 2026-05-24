# Admin costing, media e suporte

## Calculadora de custo

A edicao de produto no admin agora aceita custo de producao por gramas, horas, pos-processo, embalagem, overhead e meta de lucro. O modelo grava os campos no Prisma quando a tabela `Product` existe e mantem o JSON de overrides como fallback local/no-DB.

Campos principais:

- `estimatedGrams`
- `estimatedHours`
- `spoolPricePerKg`
- `machineHourlyRate`
- `postProcessMinutes`
- `laborHourlyRate`
- `packagingCost`
- `overheadPercent`
- `profitMode`
- `profitTargetPercent`
- `costingUpdatedAt`

## Assistente de estimativa

O fluxo e free-first:

- Ollama local via `OLLAMA_BASE_URL` e `OLLAMA_MODEL`, sem custo de rede.
- Heuristica deterministica sem rede quando nenhum provedor responde.
- Groq opcional via `GROQ_API_KEY` e `GROQ_MODEL` para prototipo rapido.

Toda resposta e marcada como `ESTIMATE`. Valores finais devem ser confirmados no slicer antes de salvar como custo real de producao.

## Midia licenciada

Videos de fundo devem ser locais e registrados em `public/media/licenses/video-assets.json`. O script `npm run media:validate` falha se uma rota/componente usar video remoto direto, se o manifesto estiver incompleto, ou se um arquivo local referenciado nao existir.

O fetch usa Pexels via `PEXELS_API_KEY` quando disponivel. YouTube, TikTok, Instagram, agua marca, uso editorial-only, logo de marca visivel ou licenca ambigua continuam rejeitados.

## Suporte

O site preserva Chatwoot, chat nativo e WhatsApp. O chat nativo apenas melhora o estado de transferencia humana e gera um atalho de WhatsApp com resumo da conversa; nao ha scraping nem automacao nao oficial do WhatsApp.
