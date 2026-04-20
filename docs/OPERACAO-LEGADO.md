# Operação do legado

## Acesso
- Admin: `/admin/login`
- Cliente: `/login` e `/conta`
- Reset: `/recuperar-senha`

## Rotina diária
1. Verifique `/api/health`.
2. Abra o admin e confira pedidos novos.
3. Atualize status do pedido quando mudar produção/expedição.
4. Revise mensagens de reset e suporte.

## O que não mexer sem cautela
- `middleware.ts`
- `auth.ts`
- `lib/session-token.ts`
- `prisma/schema.prisma`
- rotas de pagamento/webhook

## Se algo quebrar
- Consulte logs do build e do runtime.
- Confirme variáveis de ambiente.
- Valide banco, e-mail e Mercado Pago.
