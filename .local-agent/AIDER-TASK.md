Você está no projeto M:\LOJA\mdh-3d-store.

MODO AGENTE LOCAL COM AIDER + OLLAMA.
Execute de verdade.
Não responda com plano.
Não peça mais detalhes.
Leia arquivos reais.
Edite arquivos reais apenas se houver erro real.
Rode comandos reais.
Corrija somente o que estiver quebrado.

REGRAS ABSOLUTAS:
- Não recomece redesign.
- Não substitua catálogo.
- Não apague produtos.
- Não quebre checkout.
- Não quebre Mercado Pago.
- Não quebre carrinho.
- Não quebre admin.
- Não quebre /jogue.
- Não quebre feed Meta.
- Não commite .env, .env.local, tokens, API keys, DATABASE_URL, PEXELS_API_KEY, WHATSAPP_CLOUD_API_TOKEN ou secrets.
- Não use git push --force.
- Não rode npm run test:images.

ESTADO CONHECIDO:
Site: https://www.mdh3d.com.br/
Catálogo: https://www.mdh3d.com.br/catalogo
Jogo: https://www.mdh3d.com.br/jogue
Feed Meta: https://www.mdh3d.com.br/meta/catalog.csv
Instagram correto: @mdh_3d.com.br
Regra comercial: Cartão = Pix + R$ 3,00.
Catálogo esperado: cerca de 564 produtos.
Feed Meta esperado: cerca de 560 produtos válidos.

OBJETIVO:
Fazer diagnóstico local, corrigir erros reais e deixar o projeto pronto para commit local. Não faça push.

FASE 1 — Diagnóstico

Execute:

git status
git branch --show-current
git log --oneline -10
git remote -v
npm run typecheck
npm run lint:check
npm run build
npm run meta:validate-feed
npm run doctor
git diff --check

Crie ou atualize:

reports/local-agent-diagnosis.md

O relatório deve conter:
1. branch atual;
2. commit atual;
3. se working tree estava limpa;
4. comandos executados;
5. resultado de cada comando;
6. erro real encontrado;
7. arquivos suspeitos;
8. próxima correção necessária.

FASE 2 — Se algo falhar, corrija somente a causa raiz

Bloqueantes:
- npm run typecheck
- npm run lint:check
- npm run build
- npm run meta:validate-feed
- git diff --check

Se algum falhar:
- identifique arquivo e linha;
- corrija a causa raiz;
- rode novamente o comando que falhou;
- não apague funcionalidade para passar build;
- não use try/catch vazio;
- não use any sem necessidade;
- não desative lint globalmente.

FASE 3 — Preservar o que já funciona

Antes de alterar, verifique se existem e preserve:

app/meta/catalog.csv/route.ts
lib/meta-commerce-feed.ts
scripts/meta/validate-commerce-feed.mjs
lib/product-images.ts
app/jogue/page.tsx
components/game
lib/payment-pricing.ts
data/admin-product-overrides.json
app/api/admin
app/admin
components/admin

Não remova:
- feed Meta;
- catálogo real;
- regra Cartão = Pix + R$ 3;
- imagens dos cards;
- /jogue;
- admin;
- checkout;
- Mercado Pago.

FASE 4 — Feed Meta

Garantir que /meta/catalog.csv:
- retorna CSV real;
- status 200;
- Content-Type text/csv;
- não retorna HTML;
- não retorna JSON;
- não exige login;
- cabeçalho exato:
id,title,description,availability,condition,price,link,image_link,brand,google_product_category,product_type
- preço Pix no formato 49.90 BRL;
- sem R$;
- sem vírgula decimal;
- sem 12x;
- sem localhost;
- sem blob:;
- sem data:;
- link e image_link absolutos https.

Se npm run meta:validate-feed falhar:
- corrija lib/meta-commerce-feed.ts ou scripts/meta/validate-commerce-feed.mjs;
- rode novamente.

FASE 5 — Preço

Garantir centralmente:

Cartão = Pix + R$ 3,00

Verificar:
lib/payment-pricing.ts
lib/catalog.ts
lib/products.ts
professional-catalog-data.ts, se existir
components/product
components/cart
checkout
PDP
WhatsApp messages
admin product edit
JSON-LD

Se encontrar:
- 12x;
- parcelamento;
- porcentagem;
- cartão diferente de Pix + 3;
corrija.

FASE 6 — Imagens

Garantir que todo card público tenha imagem ou placeholder.

Verificar:
lib/product-images.ts
public/placeholders/product-card.svg

Fallback obrigatório:
1. product.imageGallery[0].url
2. product.imageGallery[0].src
3. product.gallery[0].url
4. product.gallery[0].src
5. product.media[0].url
6. product.media[0].src
7. product.images[0]
8. product.image
9. product.imageUrl
10. product.primaryImage
11. product.thumbnail
12. /placeholders/product-card.svg

Nenhum card pode renderizar sem imagem.

FASE 7 — Copy pública

Remover da UI pública, metadata pública e HTML validável:

Foto real
Fotos reais
foto real
fotos reais
render fiel
Render fiel
Só foto real
Foto + render
Ver peças reais
Peças reais
Fechamento rápido
Preço claro no site
Preço claro
Preço auditado
Simulação ativa
12x de
12x
mdh_impressao3d
Pokémon
Fire Red
Nintendo
Game Boy
Subway Surfers

Manter:
@mdh_3d.com.br
https://www.instagram.com/mdh_3d.com.br/

FASE 8 — /jogue

Garantir que /jogue:
- não dá Internal Error;
- builda;
- renderiza;
- tem hub de mini-games originais;
- não usa IP protegida.

Jogos permitidos:
Print Runner
Filament Catcher
Layer Stack
Nozzle Dodge
Bed Level Master
Support Breaker
Color Swap
Delivery Dash 3D
STL Puzzle
Print Tycoon Mini

Proibido:
Pokémon
Fire Red
Nintendo
Game Boy
Subway Surfers
ROM
sprites protegidos
músicas protegidas

FASE 9 — Admin

Corrigir somente se houver erro real.

Requisitos:
- salvar descrição;
- salvar pricePix;
- recalcular priceCard = Pix + 3;
- API retorna JSON sempre;
- erro retorna JSON sempre;
- frontend não chama response.json() em body vazio;
- loading não fica infinito;
- toast sucesso/erro;
- revalidar cache;
- não fingir sucesso se persistência não existe em produção.

FASE 10 — Checks finais

Rode:

npm run typecheck
npm run lint:check
npm run build
npm run meta:validate-feed
npm run doctor
git diff --check

Se existirem, rode também:

npm run catalog:validate-public-copy
npm run catalog:validate-card-prices
npm run catalog:validate-card-images
npm run security:audit
npm run seo:validate
npm run pwa:validate
npm run ux:validate
npm run support:validate

Não rode:

npm run test:images

FASE 11 — Commit local

Se houver alteração real e os checks bloqueantes passarem:

git status
git add .
git status
git commit -m "fix: stabilize MDH 3D local storefront and validations"

Não faça push.

RELATÓRIO FINAL:
Responda com:
1. modelo usado;
2. branch atual;
3. commit local criado ou não;
4. comandos executados;
5. resultado de cada comando;
6. erros encontrados;
7. arquivos alterados;
8. o que foi corrigido;
9. se feed Meta continua válido;
10. se /jogue continua válido;
11. se admin está corrigido ou pendente;
12. se Cartão = Pix + R$ 3 foi validado;
13. se termos proibidos foram removidos;
14. pendências reais;
15. se posso autorizar push.
