# Curadoria comercial e segurança MDH 3D Industrial V6

## Vitrine pública

A vitrine pública fica limitada a 12 produtos funcionais, personalizados e sem dependência de personagens de terceiros.

## Regra de preço

O custo completo inclui filamento, tempo de máquina, acabamento, embalagem, insumos de postagem, ferragens quando aplicável, preparação da personalização, reserva de falhas e despesas indiretas.

A margem bruta mínima configurada é 35%. O frete real da transportadora é calculado separadamente.

## Chaveiro

O chaveiro inclui argola com corrente, montagem, embalagem individual e insumos de postagem.

## Impressoras

A política comercial prioriza PLA, PETG, TPU e PVA, materiais classificados como ideais para Bambu Lab A1 e A1 Mini nas especificações do fabricante.

## Dependências de segurança

- Next.js 15.5.21
- NextAuth 5.0.0-beta.32
- Auth.js Core 0.41.3
- Sharp 0.35.3
- DOMPurify 3.4.12
- PostCSS 8.5.19

## Validações

- `npm run security:validate-patched-dependencies`
- `npm run security:audit:production`
- `npm run security:audit:all`

- `npm run pricing:validate-commercial`
- `npm run catalog:audit-commercial-costs:strict`
- `npm run catalog:validate-commercial-storefront`
- `npm run validate:first-sale`
- `npm run typecheck`
- `npm run lint:check`
- `npm run build`

## Entrega de produção

A Industrial V6 valida catálogo, precificação, autenticação, banco, rotas privadas, regressões públicas, TypeScript, lint e build antes de qualquer promoção para produção.
