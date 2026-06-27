Você está no projeto M:\LOJA\mdh-3d-store.

MODO AGENTE LOCAL — ROO CODE + OLLAMA.
Use ferramentas reais.
Leia arquivos.
Edite arquivos.
Rode comandos.
Corrija erros.
Não responda com plano.
Não peça mais detalhes.
Não finja implementação.
Não encerre sem validar.

IMPORTANTE SOBRE HARDWARE:
Este PC tem 16 GB RAM e GPU com cerca de 8 GB VRAM. Trabalhe em etapas objetivas. Não tente reescrever o projeto inteiro de uma vez. Não carregue contexto desnecessário.

REGRAS ABSOLUTAS:
- Não altere main diretamente.
- Não use git push --force.
- Não commite .env, .env.local, tokens, API keys, DATABASE_URL, PEXELS_API_KEY, WHATSAPP_CLOUD_API_TOKEN ou secrets.
- Não rode npm run test:images.
- Não substitua o catálogo real.
- Não apague produtos.
- Não quebre checkout.
- Não quebre Mercado Pago.
- Não quebre carrinho.
- Não quebre admin.
- Não quebre feed Meta.
- Não recomece redesign do zero.
- Não use Pokémon, Fire Red, Nintendo, Game Boy, Subway Surfers, ROMs, sprites ou músicas protegidas.
- Toda API alterada deve retornar JSON em sucesso e erro.
- Se algo depender de variável de ambiente ausente, documente como pendência de ambiente e não invente valor.

ESTADO CONHECIDO DO PROJETO:
- Projeto: MDH 3D Store.
- Site: https://www.mdh3d.com.br/
- Catálogo: https://www.mdh3d.com.br/catalogo
- Jogo: https://www.mdh3d.com.br/jogue
- Feed Meta: https://www.mdh3d.com.br/meta/catalog.csv
- Instagram correto: @mdh_3d.com.br
- Instagram URL: https://www.instagram.com/mdh_3d.com.br/
- Regra comercial obrigatória: Cartão = Pix + R$ 3,00.
- Branch profissional anterior: fix/mdh3d-professional-fullstack-10
- Commit profissional informado: 9aae692
- Branch feed Meta anterior: fix/meta-commerce-catalog-feed
- Commit feed Meta informado: 8eaef49
- Catálogo real esperado: cerca de 564 produtos.
- Feed Meta esperado: cerca de 560 produtos válidos.
- Não destruir o que já foi implementado.

OBJETIVO DESTA RODADA:
Fazer o projeto ficar estável localmente e pronto para push/deploy, corrigindo qualquer erro real encontrado em:
1. build;
2. lint;
3. typecheck;
4. feed Meta;
5. admin salvar preço/descrição;
6. /jogue;
7. copy pública antiga;
8. regra Cartão = Pix + R$ 3;
9. imagens obrigatórias nos cards;
10. chatbot/support, se já existir;
11. PWA/SEO/security validators, se já existirem.

FASE 1 — DIAGNÓSTICO SEM ALTERAR ARQUIVOS

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

Se algum script não existir, registre no relatório e continue.
Se algum comando falhar, pare a fase de diagnóstico e corrija a causa raiz na fase seguinte.

Crie ou atualize:

reports/local-agent-diagnosis.md

O relatório deve conter:
1. branch atual;
2. commit atual;
3. se working tree estava limpa;
4. comandos executados;
5. resultado de cada comando;
6. erro real encontrado, se houver;
7. arquivos suspeitos;
8. próxima correção necessária.

FASE 2 — NÃO QUEBRAR O QUE JÁ FUNCIONA

Antes de editar, verifique se existem:

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

Se algum existir, preserve.
Não remova feed Meta.
Não remova catálogo.
Não remova /jogue.
Não remova admin.
Não remova checkout.
Não remova Mercado Pago.

FASE 3 — CORRIGIR BUILD, TYPECHECK E LINT

Se npm run build, typecheck ou lint falhar:
- identifique arquivo e linha;
- corrija a causa raiz;
- não use any sem necessidade;
- não desative regra global de lint;
- não apague código funcional para passar build;
- não coloque try/catch vazio;
- não retorne null para esconder erro;
- não altere checkout/Mercado Pago se o erro não for deles.

Depois rode novamente:

npm run typecheck
npm run lint:check
npm run build

Esses três são bloqueantes.

FASE 4 — FEED META

Garantir que /meta/catalog.csv:
- retorna CSV real;
- status 200;
- Content-Type text/csv;
- não retorna HTML;
- não retorna JSON;
- não exige login;
- tem cabeçalho exato:
id,title,description,availability,condition,price,link,image_link,brand,google_product_category,product_type
- usa preço Pix no formato 49.90 BRL;
- não usa R$;
- não usa vírgula decimal;
- não usa preço cartão;
- não usa 12x;
- não usa localhost;
- não usa blob:;
- não usa data:;
- não usa imagem relativa quebrada;
- usa link absoluto https://www.mdh3d.com.br/...
- usa image_link absoluto https://...
- remove termos proibidos no CSV.

Termos proibidos no feed:
Foto real
fotos reais
render fiel
12x
mdh_impressao3d

Se npm run meta:validate-feed falhar:
- corrija lib/meta-commerce-feed.ts ou scripts/meta/validate-commerce-feed.mjs;
- rode novamente npm run meta:validate-feed;
- não quebre build.

FASE 5 — PREÇO CARTÃO

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

A função central deve ser:

calculateCardPrice(pricePix) = pricePix + 3.00

Se scripts existirem, rode:

npm run catalog:fix-card-prices
npm run catalog:validate-card-prices

FASE 6 — IMAGENS OBRIGATÓRIAS

Garantir que todo card público tenha imagem ou placeholder.

Verificar/criar:

lib/product-images.ts
public/placeholders/product-card.svg

A função getPrimaryProductImage(product) deve tentar:

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

Regras:
- nenhum card pode renderizar sem imagem;
- nenhum card pode retornar null por falta de imagem;
- usar fallback onError;
- se next/image der problema com domínio remoto, usar img no card público;
- manter aspect-ratio para evitar CLS;
- placeholder precisa existir.

Se script existir, rode:

npm run catalog:validate-card-images

FASE 7 — COPY PÚBLICA E INSTAGRAM

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

Trocar por:
@mdh_3d.com.br
https://www.instagram.com/mdh_3d.com.br/

Textos substitutos permitidos:
Imagem do produto
Mídia do catálogo
Produto catalogado
Compra rápida
Pix e cartão informados antes de comprar
Cartão: Pix + R$ 3,00
Instagram oficial @mdh_3d.com.br

Se script existir, rode:

npm run catalog:validate-public-copy

FASE 8 — /JOGUE

Garantir que /jogue:
- não dá Internal Error;
- builda;
- renderiza no servidor;
- funciona no navegador;
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

Se algum componente quebrar SSR:
- usar dynamic import com ssr:false apenas onde necessário;
- manter a página renderizando fallback estável.

Proibido:
Pokémon
Fire Red
Nintendo
Game Boy
Subway Surfers
ROM
emulador comercial
sprites protegidos
músicas protegidas

FASE 9 — ADMIN SALVAR PREÇO/DESCRIÇÃO

Corrigir somente se houver erro real.

Verificar:
app/admin/products
components/admin
app/api/admin/products
lib/server/admin-catalog-store.ts
data/admin-product-overrides.json

Requisitos:
- salvar descrição;
- salvar pricePix;
- recalcular priceCard = Pix + 3;
- API sempre retorna JSON;
- erro sempre retorna JSON;
- frontend não chama response.json() em body vazio;
- loading não fica infinito;
- toast sucesso/erro;
- revalidar cache;
- não fingir sucesso se persistência não existe em produção;
- se Vercel não puder escrever em arquivo runtime, mostrar erro claro ou usar banco configurado.

Formato de sucesso:
{
  "ok": true,
  "persisted": true,
  "product": {}
}

Formato de erro:
{
  "ok": false,
  "code": "ERROR_CODE",
  "error": "mensagem clara"
}

FASE 10 — CHATBOT / SUPORTE

Se o chatbot MDH3D CHAT BOT já existir:
- estabilizar sem quebrar build;
- garantir que widget não quebre checkout;
- garantir APIs com JSON sempre;
- proteger admin support;
- não usar WhatsApp Web scraping;
- WhatsApp Cloud API apenas via env;
- fallback: admin inbox + Web Push + wa.me manual.

Se chatbot não existir ainda:
- não começar implementação grande nesta rodada se houver erros de build/admin/feed;
- registrar como pendência.

FASE 11 — SEGURANÇA, SEO, PWA, UX

Se scripts existirem, rodar e corrigir erros reais:

npm run security:audit
npm run seo:validate
npm run pwa:validate
npm run ux:validate

Não quebrar:
- CSP;
- HSTS;
- X-Content-Type-Options;
- Referrer-Policy;
- Permissions-Policy;
- sitemap;
- robots;
- canonical;
- Product JSON-LD;
- Organization JSON-LD;
- PWA manifest;
- service worker.

Se falhar por env ausente local:
- documentar como pendência de ambiente;
- não inventar segredo.

FASE 12 — VALIDAÇÕES FINAIS

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

Se algum comando bloqueante falhar:
- corrija;
- rode novamente;
- não faça commit quebrado.

Bloqueantes:
typecheck
lint:check
build
meta:validate-feed
git diff --check

Doctor só é bloqueante se não for erro de env local ausente.

FASE 13 — COMMIT LOCAL

Se houver alteração real e os checks bloqueantes passarem:

git status
git add .
git status
git commit -m "fix: stabilize MDH 3D local storefront and validations"

Não faça push sem autorização explícita minha.

FASE 14 — RELATÓRIO FINAL

Responder com:

1. modo usado;
2. modelo usado;
3. branch atual;
4. commit local criado ou não;
5. comandos executados;
6. resultado de cada comando;
7. erros encontrados;
8. arquivos alterados;
9. o que foi corrigido;
10. se feed Meta continua válido;
11. se /jogue continua válido;
12. se admin está corrigido ou pendente;
13. se Cartão = Pix + R$ 3 foi validado;
14. se termos proibidos foram removidos;
15. pendências reais;
16. se posso autorizar push.

CRITÉRIO DE ACEITE:
Só finalizar como concluído se:
- typecheck passou;
- lint passou;
- build passou;
- meta:validate-feed passou;
- git diff --check passou;
- nenhuma alteração perigosa em .env/secrets;
- catálogo real preservado;
- checkout preservado;
- Mercado Pago preservado;
- feed Meta preservado;
- /jogue preservado;
- admin não piorou.
