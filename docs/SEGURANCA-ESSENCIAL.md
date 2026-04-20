# Segurança essencial

## Regras
- Nunca commitar segredos.
- Não usar defaults inseguros em produção.
- Manter cookies `httpOnly`, `secure` e `sameSite` adequados.
- Não logar senha, token, CPF, e-mail em claro sem necessidade.

## Áreas sensíveis
- `auth.ts`
- `middleware.ts`
- `lib/session-token.ts`
- `app/api/auth/password-reset/*`
- `app/api/admin/*`

## Após reset de senha
- Sessões antigas devem cair.
- Token de reset não pode ser reutilizado.
