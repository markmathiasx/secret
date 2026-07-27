# Prompt de manutenção para Codex

Trabalhe apenas na branch de curadoria e nunca diretamente em `main`.

Antes de editar, leia `package.json`, `lib/catalog.ts`, `lib/catalog-pricing-policy.ts`, `lib/operational-costs.ts`, `types/admin-catalog.ts`, `lib/commerce/first-sale-products.ts` e `components/commerce/IntentPageTemplate.tsx`.

Objetivo obrigatório:

1. preservar a arquitetura Next.js atual;
2. impedir preço público abaixo do custo completo;
3. usar margem bruta real de 30%, não markup de 30%;
4. incluir argola, corrente, montagem, embalagem individual e insumos de postagem em chaveiros;
5. manter o frete real separado;
6. preservar overrides de preço apenas quando estiverem acima do preço seguro;
7. não alterar `mdh-main-publish` nem `mdh-prod-deploy`;
8. executar preflight, validação comercial, auditoria, typecheck, lint e build;
9. não fazer commit nem push se qualquer validação obrigatória falhar;
10. mostrar o diff final e a lista exata dos arquivos alterados.
