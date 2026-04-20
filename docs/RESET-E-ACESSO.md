# Reset e acesso

## Fluxo do cliente
1. A pessoa entra em `/recuperar-senha`.
2. Informa o e-mail.
3. O sistema gera token único com expiração.
4. O link abre a página de redefinição no site.
5. Após usar, o token expira por uso único.

## Fluxo operacional
- Toda solicitação gera trilha em `PasswordResetRequest`.
- A equipe recebe aviso em `markmathias02@gmail.com`.
- O admin pode enviar link manual em `/admin/users`.

## Segurança
- Não reutilizar token.
- Não passar senha por e-mail.
- Não expor dados em logs.
