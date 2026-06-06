# Auth, DB e Storage

Esta fundacao adiciona rotas dedicadas de conta, persistencia Prisma para perfis/pedidos/arquivos/auditoria e storage privado com fallback local somente em desenvolvimento.

## Rotas

- `/cadastro`: cadastro de cliente.
- `/login`: login de cliente.
- `/perfil`: area protegida reaproveitando a conta atual.
- `/pedidos`: pedidos protegidos reaproveitando a conta atual.
- `/api/auth/me`: sessao atual em JSON.
- `/api/files/upload`: upload autenticado com validacao de tipo, tamanho e assinatura.
- `/api/files/[id]`: metadados protegidos de arquivo.

## Persistencia

- Prisma: modelos `UserProfile`, `ProductOverride`, `FileAsset`, `SupportConversation`, `SupportMessage` e `AuditLog`.
- Produção: se `DATABASE_URL`/`DIRECT_URL` nao estiverem validas, APIs sensiveis retornam erro JSON em vez de gravar em memoria/arquivo.
- Desenvolvimento: fallback local existe apenas para continuar testando sem banco externo.

## Segurança

- Senhas usam hash no servidor.
- Login, cadastro, logout e upload gravam auditoria quando o banco esta disponivel.
- IP e user-agent sao gravados como hash em `AuditLog`.
- Upload valida extensao, MIME, tamanho e assinatura basica do arquivo.
- `SUPABASE_SERVICE_ROLE_KEY` e `SUPABASE_SECRET_KEY` nunca devem ter prefixo `NEXT_PUBLIC_`.

## Validacao

```powershell
npm run validate:auth
npm run validate:db-storage
npm run validate:private-routes
```
