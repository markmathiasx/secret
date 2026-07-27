# Padrão comercial MDH 3D

## Regra obrigatória de preço

O preço público nunca pode ficar abaixo do custo completo dividido por `1 - margem bruta`.

```text
preço mínimo = custo completo / (1 - margem bruta)
```

Margem bruta mínima padrão: **30%**.

## Custo completo

- filamento;
- horas de máquina;
- acabamento e montagem;
- embalagem do produto;
- ferragens e acessórios;
- envelope ou caixa de postagem;
- etiqueta, fita e proteção;
- reserva para falhas;
- despesas indiretas;
- preparação da personalização.

O frete real cobrado por Correios ou transportadora é calculado separadamente.

## Chaveiros

Cada chaveiro deve considerar, no mínimo:

- argola metálica: R$ 0,22;
- corrente metálica: R$ 0,18;
- embalagem individual: R$ 0,25;
- insumos externos do pedido: R$ 0,70 por pedido;
- preparação personalizada: R$ 5,00 por pedido personalizado;
- reserva para falhas: 8%;
- despesas indiretas: 8%;
- margem bruta mínima: 30%.

Em lotes, os custos por pedido são divididos pela quantidade. Os custos unitários continuam multiplicados pela quantidade.

## Rotina de validação

```powershell
npm run pricing:keychain -- --grams=15 --hours=0.6 --quantity=1 --personalized
npm run pricing:validate-commercial
npm run catalog:audit-commercial-costs
npm run typecheck
npm run lint:check
npm run build
```
