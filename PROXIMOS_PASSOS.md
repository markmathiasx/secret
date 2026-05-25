# Próximos passos práticos

1. [CONCLUÍDO] Faça commit do estado local que realmente está melhor do que o GitHub público.
2. [CONCLUÍDO] Remova do catálogo os 1000 itens sintéticos e troque por um catálogo de 48 SKUs reais.
3. [EM ANDAMENTO] Troque o painel legado `/painel-mdh-85` por um admin consistente (Estrutura /admin já ativa).
4. [CONCLUÍDO] Atualize:
   - README.md
   - package.json
   - .env.example
   - app/layout.tsx
   - middleware.ts
   - lib/constants.ts
5. [PRÓXIMO] Só depois suba as imagens definitivas.

## Antes do push
- npm run typecheck
- npm run build
- npm run doctor

## Depois do push
- Redeploy na Vercel
- Teste home, catálogo, login, checkout e admin