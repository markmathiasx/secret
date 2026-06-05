# Auditoria completa - MDH 3D

Gerado em: 2026-06-04
Worktree publicado: `M:\LOJA\mdh-prod-deploy`
Branch: `main`
Baseline antes desta rodada: `6d7e43c feat: upgrade support bot and apply plus2 catalog pricing`

## Escopo aplicado

- Catalogo com 564 produtos publicos.
- Regra comercial validada: Pix = valor base + R$ 2,00; cartao = Pix + R$ 1,00.
- Script exigido criado: `scripts/catalog/apply-plus2-increase.mjs`, delegando para a rotina idempotente de +R$ 2,00.
- WhatsApp oficial mantido no fallback publico: `5521974137662`.
- Instagram oficial mantido no fallback publico: `@mdh_3d.com.br`.
- Central de atendimento treinada contra o catalogo real, com 564 produtos indexados.
- Arcade `/jogue` preservado com 11 jogos implementados, incluindo Pinball.
- Limpeza de copy antiga aplicada em arquivos rastreados do app, dados e scripts relevantes.
- Curadoria de seguranca aplicada nos limites de entrada de APIs administrativas, checkout e Pix, alem da auditoria automatizada sem achados criticos.

## Comandos de auditoria inicial

```text
git log --oneline -10
6d7e43c feat: upgrade support bot and apply plus2 catalog pricing
ad800c6 fix: restore 32c3606 pricing security and 883ccb0 arcade
f00779e fix: restore catalog values and preserve arcade with pinball
e52ed5a fix: alinhar precos do catalogo
883ccb0 fix: restaurar arcade completo com pinball
ebdcbc1 feat: add pinball star game
49ea401 Merge pull request #10 from markmathiasx/improvement/mdh3d-admin-costing-visual-media
74b136e feat: add admin production costing, safer saves, licensed media pipeline, and visual storefront upgrade
0685d61 feat: overhaul MDH 3D visual experience
db8c609 feat: add licensed Pexels 3D printer media
```

`git status` indicou mudancas apenas no worktree de publicacao `main`, cobrindo APIs, copy publica, scripts de validacao, manifestos de imagem, relatorios e o novo script de precificacao.

## Resultado dos checks

- `npm run typecheck`: passou.
- `npm run lint:check`: passou.
- `npm run build`: passou, com 1.235 paginas geradas.
- `npm run security:audit`: passou, sem achados criticos.
- `npm run catalog:apply-plus2-increase`: passou, 564 produtos processados.
- `npm run catalog:validate-plus2-pricing`: passou, 564 produtos com Pix + R$ 2,00 e cartao = Pix + R$ 1,00.
- `npm run catalog:validate-card-prices`: passou, 564 produtos com cartao = Pix + R$ 1,00.
- `npm run catalog:validate-public-copy`: passou, 337 arquivos publicos sem copy proibida.
- `npm run catalog:validate-card-images`: passou, 559 cards publicos com imagem propria e 0 usando placeholder.
- `npm run support:validate`: passou, 564 produtos indexados e 7 prompts obrigatorios validados.
- `npm run meta:validate-feed`: passou, feed Meta Commerce com 560 produtos e 4 ignorados por regra.
- `npm run seo:validate`: passou.
- `npm run pwa:validate`: passou.
- `npm run ux:validate`: passou.
- `git diff --check`: passou; avisos apenas de normalizacao LF/CRLF do Windows.

## Greps obrigatorios

Todos os comandos abaixo retornaram zero linhas nos arquivos `ts`, `tsx`, `js` e `json` rastreados:

```text
git grep -in "<telefone legado>" -- "*.ts" "*.tsx" "*.js" "*.json"
git grep -in "<instagram legado>" -- "*.ts" "*.tsx" "*.js" "*.json"
git grep -in "<texto placeholder legado>" -- "*.ts" "*.tsx" "*.js" "*.json"
```

A varredura adicional de copy antiga do prompt tambem retornou zero linhas nos arquivos rastreados do app, scripts e dados, excluindo apenas historicos de `reports`, documentos antigos e prompts de geracao fora da aplicacao publicada.

## Observacoes

- O worktree `M:\LOJA\mdh-3d-store` permanece em outro branch com arquivos locais nao rastreados do Qwen e nao foi usado para publicar o `main`.
- A validacao local final deve ser feita a partir de `M:\LOJA\mdh-prod-deploy`, que e o mesmo codigo commitado e enviado para producao.
