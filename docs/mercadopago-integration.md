# Mercado Pago Integration

## Arquitetura

- **Frontend**: `components/checkout/mercadopago-payment-brick.tsx`
- **Status Screen**: `components/checkout/mercadopago-status-brick.tsx`
- **Checkout pages**: `/checkout`, `/checkout/sucesso`, `/checkout/falha`, `/checkout/pendente`
- **Backend**: `app/api/orders/route.ts` cria pedido + pagamento e persiste `external_reference`
- **Webhook**: `app/api/webhooks/mercadopago/route.ts`

## Fluxo card

1. O usuário completa o checkout.
2. O Payment Brick monta com `NEXT_PUBLIC_MP_PUBLIC_KEY`.
3. `onSubmit` envia o formData ao backend.
4. O backend recria o total, cria o pagamento com `MERCADOPAGO_ACCESS_TOKEN` e salva a correlação.
5. O usuário é redirecionado para `/checkout/sucesso` ou `/checkout/pendente`.

## Fluxo Pix

1. O Payment Brick permite Pix quando habilitado na conta.
2. O backend cria o pagamento Pix e retorna `pixPayload` / QR.
3. A página de retorno consolida o estado e exibe o Status Screen Brick.

## Webhook

- Endpoint canônico: `POST /api/webhooks/mercadopago`
- Valida assinatura com `MERCADOPAGO_WEBHOOK_SECRET`
- Busca o pagamento completo por `data.id`
- Atualiza pedido/pagamento por `external_reference`
- Reenvios repetidos são tratados de forma idempotente

## Status mapping

- `approved` -> `paid`
- `pending`, `in_process`, `authorized` -> `pending_payment`
- `rejected` -> `failed`
- `cancelled` -> `cancelled`
- `refunded` -> `refunded`
- `charged_back` -> `chargeback_open`

## Env vars

- `NEXT_PUBLIC_MP_PUBLIC_KEY`
- `MERCADOPAGO_ACCESS_TOKEN`
- `MERCADOPAGO_WEBHOOK_SECRET`
- `MERCADOPAGO_APP_ID`
- `MP_STATEMENT_DESCRIPTOR`
- `MP_TIMEOUT_MS`

## Troubleshooting

- **Bricks não renderizam**: verifique `NEXT_PUBLIC_MP_PUBLIC_KEY`
- **Pagamento não cria**: verifique `MERCADOPAGO_ACCESS_TOKEN`
- **Webhook não confirma**: verifique `MERCADOPAGO_WEBHOOK_SECRET` e o domínio canônico
- **Pedido não atualiza**: confira `external_reference` e os logs sanitizados

## Rollback seguro

1. Remova o env inválido no painel.
2. Reimplante a versão anterior.
3. O fluxo antigo pode continuar operando com Pix/manual enquanto a credencial correta é corrigida.
