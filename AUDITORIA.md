# MDH 3D — Auditoria objetiva do site e do repositório

## O que eu consegui verificar
Esta auditoria foi feita a partir do site público e do repositório público no GitHub.

## Diagnóstico resumido
1. O site público melhorou visualmente, mas o catálogo ao vivo ainda está sintético e repetitivo.
2. O repositório público `main` ainda está com documentação e configuração antigas.
3. A base pública no GitHub ainda não reflete uma stack enterprise consolidada.
4. A página de catálogo ao vivo ainda anuncia **1000 resultados** e usa famílias artificiais como `Hello Kitty Mini`, `Hello Kitty Compact`, `Hello Kitty Desk`, `Hello Kitty Padrão`, `Hello Kitty Plus`, `Hello Kitty Max`, `Hello Kitty Wall`, `Hello Kitty Pro`, `Hello Kitty Premium`, `Hello Kitty Collector`.
5. O repositório público ainda não expõe scripts de operação como `db:migrate`, `db:seed`, `catalog:images` e `doctor` no `package.json` público.
6. `layout.tsx` público contém conflito/duplicação de `siteUrl` e metadata colada de forma incorreta.
7. `.env.example` público ainda usa `ADMIN_PASSWORD` e `ADMIN_SESSION_TOKEN`, e ainda trata Supabase como opcional.
8. `middleware.ts` público ainda bloqueia `/admin` com 404 e protege apenas a rota oculta `/painel-mdh-85`.
9. `constants.ts` público ainda cai para `mdh___021` por padrão, mantendo inconsistência de marca.

## Prioridade real
### Corrigir primeiro
- alinhar o **main** do GitHub com o melhor estado local
- remover catálogo sintético do ar
- padronizar marca e contatos
- consertar a base técnica pública (package.json, README, .env.example, layout.tsx)
- trocar o painel oculto legado por um admin consistente

### Corrigir depois
- trocar mídia placeholder por fotos reais/geradas
- redesenhar home final
- endurecer auth, sessão, rate limit e admin

## O que NÃO fazer
- não usar merge cego
- não aceitar “Accept both changes” sem limpar
- não publicar mais commits “final: loja pronta para produção” se o repositório ainda estiver inconsistente
- não manter o catálogo de 1000 itens sintéticos no ar

## Resultado recomendado
1. Subir primeiro uma versão consolidada e limpa do código.
2. Só depois publicar catálogo novo com SKUs reais.
3. Só depois adicionar imagens definitivas.