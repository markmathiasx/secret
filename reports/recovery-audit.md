# Recovery Audit

Data: 2026-05-25

## Respostas

1. `lib/catalog.ts` foi restaurado para o catalogo completo e nao ficou reduzido para 48 produtos. A validacao atual carrega 564 produtos publicos.
2. IDs antigos do catalogo foram preservados. Confirmado por `findProduct`: `real-001`, `real-002`, `real-003`, `mdh-013` e `mdh-038` existem; `mdh-a1-001` nao existe mais porque fazia parte da migracao parcial de 48 SKUs.
3. `findProduct` volta a encontrar os produtos usados por PDP, carrinho, checkout e admin. O build gerou 564 rotas de produto em `/catalogo/[slug]`.
4. A falha em `/api/checkout/preference` vinha do import de `lib/products.ts`: ele executava `assertProduct("mdh-a1-001")` no carregamento do modulo. Como o catalogo real nao tinha mais esse ID, a coleta de page data falhava antes da rota responder.
5. `.env.example` tinha credenciais fracas de exemplo. Foram substituidas por placeholders e hash de senha.
6. `lib/professional-catalog-data.ts` foi removido. Ele representava a migracao parcial para 48 SKUs e continha exemplos de `priceCard` diferentes de Pix + R$ 3,00.
7. `lib/products.ts` foi restaurado para IDs reais do catalogo e ajustado para remover copy publica proibida. `priceCard` continua calculado por `calculateCardPrice`.
8. Termos proibidos foram removidos da UI publica e fontes publicas validadas. `catalog:validate-public-copy` passou e `catalog:validate-taxonomy` passou.
9. Falta antes do push apenas a validacao local, commit, push, deploy Vercel e validacao publica de producao.

## Estado Validado

- Catalogo publico: 564 produtos.
- Produtos com imagem propria: 564.
- Produtos usando placeholder: 0.
- Menor Pix: R$ 19,90.
- Menor Cartao: R$ 22,90.
- Regra validada: `priceCard = pricePix + 3.00`.

## Persistencia Admin

- Quando o banco esta disponivel, `app/api/admin/products/[id]/route.ts` salva no Prisma e retorna JSON com `ok`, `persisted`, `source`, `message` e `product`.
- Quando o banco nao esta disponivel localmente, o fallback seguro grava `data/admin-product-overrides.json`.
- Em Vercel sem banco gravavel, a rota bloqueia a atualizacao com erro JSON claro em vez de fingir sucesso em arquivo nao duravel.
- `npx prisma generate` passou. `npx prisma migrate status` foi bloqueado localmente porque `DIRECT_URL` nao esta configurada; nenhuma migration foi aplicada.
