# Protocolo de Execucao Codex - Marketplace MDH 3D

Este protocolo e permanente para trabalhos no escopo "MDH 3D nivel Apple/ML/AliExpress/Shopee".

## Ordem obrigatoria

1. Confirmar clone, branch, remoto e commit atual.
2. Executar a Fase 0 antes de qualquer fase funcional.
3. Atualizar `RELATORIO-EXECUCAO-MARKETPLACE.md` a cada bloco verificavel.
4. Executar gates obrigatorios antes de declarar qualquer fase como concluida.
5. Commitar somente artefatos coerentes com a evidencia gerada.

## Fase 0

A Fase 0 deve reconciliar documentos antigos contra o estado real do repositorio. Documentos como `COMPLETION-VERIFICATION.md`, `FINAL_SUMMARY.md`, `CONCLUSION.md` e `IMPLEMENTATION-SUMMARY.md` sao hipoteses antigas, nao prova atual.

Use:

```bash
npm run marketplace:phase0
```

O comando gera:

- `RELATORIO-EXECUCAO-MARKETPLACE.md`
- `reports/marketplace-phase0-reconciliation.json`

## Gates obrigatorios

Use:

```bash
npm run marketplace:verify-gates
npm run marketplace:phase0
```

O primeiro comando executa e registra:

- `npm run db:generate`
- `npm run typecheck`
- `npm run lint:check`
- `npm run build`
- `npm run validate:industrial-ui`
- `npm run validate:auth`
- `npm run validate:db-storage`
- `npm run validate:private-routes`
- `npm run validate:public-regressions`
- `npm run security:audit`
- `npm audit --audit-level=low`

O segundo comando incorpora os resultados ao relatorio principal.

## Regra de percentual

- `100%` so pode ser usado quando houver prova atual em codigo, comandos e validacao runtime aplicavel.
- Se qualquer gate obrigatorio falhar, nenhuma fase relacionada pode ficar acima de `99%`.
- Se credencial real estiver ausente, usar sandbox/teste quando seguro e registrar a pendencia. Nao fingir producao.
- Dados de preco, estoque, avaliacao, prazo, prova social e metricas precisam vir de fonte real do projeto.

## Evidencia minima por tipo

| Tipo | Evidencia minima |
| --- | --- |
| Codigo | Arquivo/rota/modelo localizado no repo atual |
| Fluxo comercial | Teste carrinho -> pedido -> checkout/rastreio |
| Producao | URL publica validada com status e conteudo esperado |
| Seguranca | Scanner, headers e storage sem token com resultado registrado |
| UX/A11y | Screenshot/Playwright, Lighthouse ou axe com antes/depois |
| Catalogo | Relatorio de catalogo e amostra de produtos reais |

## Proibido

- Recomeçar redesign sem necessidade comprovada.
- Marcar fase como concluida por narrativa.
- Usar imagens placeholder como se fossem foto real.
- Comitar `.env`, tokens, secrets ou credenciais.
- Usar `git push --force`.
- Alterar preco, checkout, catalogo ou jogos fora do escopo ativo sem registrar motivo e validacao.
