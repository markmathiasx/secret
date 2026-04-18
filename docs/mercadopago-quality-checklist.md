# Mercado Pago Quality Checklist

## O que foi implementado

- Payment Brick no checkout
- Status Screen Brick nas telas de retorno
- Pedido e pagamento correlacionados por `external_reference`
- Webhook com validação de assinatura e idempotência
- Persistência do status de pagamento no backend

## Onde validar

- `components/checkout/mercadopago-payment-brick.tsx`
- `components/checkout/mercadopago-status-brick.tsx`
- `app/api/orders/route.ts`
- `app/api/webhooks/mercadopago/route.ts`

## Env obrigatórias

- `NEXT_PUBLIC_MP_PUBLIC_KEY`
- `MERCADOPAGO_ACCESS_TOKEN`
- `MERCADOPAGO_WEBHOOK_SECRET`
- `NEXT_PUBLIC_SITE_URL`

## Como testar local

1. Definir as envs no `.env.local`
2. Rodar `npm run build`
3. Abrir `/checkout`
4. Finalizar um pedido com Pix ou cartão
5. Confirmar que a resposta inclui `orderCode`, `paymentId` e `redirectUrl`

## Como testar preview / produção

1. Subir as envs no Vercel
2. Reimplantar
3. Validar `/api/payments/status`
4. Validar `/checkout/sucesso`, `/checkout/falha`, `/checkout/pendente`

## Como medir qualidade

- Confirmar que o Payment Brick renderiza sem fallback
- Confirmar que o backend devolve `external_reference`
- Confirmar que o webhook grava o `paymentId`
- Confirmar que o pedido muda de `pending_payment` para `paid`
- Confirmar que a página de retorno mostra o Status Screen Brick

## Checklist de produção

- [ ] Public key configurada
- [ ] Access token configurado
- [ ] Webhook secret configurado
- [ ] Webhook canônico apontado para o domínio público
- [ ] Pedido atualiza pelo backend/webhook
- [ ] Logs não expõem tokens completos
- [ ] Checkout, conta e tracking respondem 200

## Riscos remanescentes

- Se a public key do Mercado Pago não estiver configurada, o Payment Brick não monta.
- Se o webhook secret estiver divergente, o evento é rejeitado.
- Se o painel do Mercado Pago estiver em modo teste, os pagamentos seguem a regra do ambiente de teste.
