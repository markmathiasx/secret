# Commerce OS MDH3D

Este documento registra a metodologia permanente do TXT atual.

## Ordem de execucao

1. Auditar antes de alterar.
2. Registrar evidencias em docs e reports.
3. Fazer mudancas aditivas primeiro.
4. Rodar validadores.
5. Nunca marcar 100% quando existir bloqueio real.

## Comandos operacionais

```bash
npm run marketplace:phase0
npm run marketplace:audit-phases
npm run commerce-os:validate
npm run commerce-os:score
npm run commerce-os:backup
```

`commerce-os:score` deve falhar enquanto qualquer pilar estiver abaixo de 100. Isso e esperado e impede conclusao falsa.

## Superficies adicionadas

| Area | Arquivo |
| --- | --- |
| Product Master Data | src/lib/catalog/* |
| Navegacao central | src/config/navigation.ts |
| PriceOps seguro | src/lib/priceops/* |
| ChannelOps seguro | src/lib/channelops/channels.ts |
| FeedOps health | src/lib/feedops/health.ts |
| APIOps auth | src/lib/apiops/auth.ts |
| Health protegido | app/api/admin/commerce-os/health/route.ts |
| Backup/Rollback seguro | scripts/commerce-os/backup-catalog.mjs e rollback-catalog.mjs |

## Regras nao negociaveis

- Sem credencial hardcoded.
- Sem marketplace automation de login/captcha.
- Sem alteracao de preco sem backup, dry-run, margem minima e rollback.
- Sem placeholder tratado como foto real.
- Sem finalizar com score 100 quando o script apontar gaps.
