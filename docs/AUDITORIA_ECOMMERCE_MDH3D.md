# Auditoria Ecommerce MDH3D

Data: 2026-06-14.

## Estrutura atual

- `app/loja/page.tsx`: vitrine inteligente baseada em `data/produtos.csv`.
- `app/produto/[slug]/page.tsx`: pagina de produto CSV com SEO, schema, galeria, compra/orcamento e prova social local.
- `app/catalogo/**`: catalogo legado preservado, com produtos reais existentes.
- `app/carrinho/page.tsx` e `components/cart-*`: carrinho legado preservado.
- `components/mdh-store/**`: componentes da loja inteligente local.
- `lib/mdh-store/**`: normalizacao CSV, links WhatsApp, feeds, analytics, promocoes e prova social.
- `lib/pricing-engine.ts` e `lib/catalog-pricing-policy.ts`: preco por custo de producao com lucro de 30% e cartao Pix + R$ 1.
- `app/feeds/**`: feeds Google, Meta, TikTok e JSON local.
- `data/copa-theme-expansion-300.json`: expansao de 300 SKUs Copa/temas populares com imagens proprias.
- `app/sitemap.ts`, `app/sitemap-products.xml/route.ts`, `app/robots.ts`: SEO tecnico e descoberta de produtos.
- `app/ofertas/page.tsx`: cupons, combos e vitrines por faixa de preco.
- `app/orcamento-personalizado/page.tsx`: personalizador/orcamento 3D sem API externa.

## Integracoes existentes

- Nuvemshop: somente link externo no CSV, sem token ou chamada de API.
- WhatsApp: `buildWhatsappUrl`, `buildCartWhatsappUrl` e `buildCustomQuoteWhatsappUrl`.
- Mercado Pago: checkout legado preservado.
- GTM, Meta Pixel e TikTok Pixel: opcionais por variavel de ambiente; se vazios, o site nao quebra.
- Supabase/Prisma: preservados no projeto, mas nao usados pela loja CSV local.

## O que foi alterado

- Normalizador CSV ampliado com material, cores, personalizacao, galeria, video opcional, cuidados, FAQ e score de marketplace.
- `/loja` ganhou busca com autocomplete, sinonimos, filtros por categoria, uso, material, cor, preco, personalizacao e ordenacao.
- Carrinho local ganhou drawer, cupom local, barra de frete gratis e link individual de Nuvemshop quando existir.
- `/produto/[slug]` ganhou galeria com zoom, frete por CEP, detalhes de material/cor/cuidados, reviews, Q&A, FAQ schema e breadcrumb schema.
- Criados `/ofertas`, `/orcamento-personalizado`, `/feeds/tiktok-catalog.csv` e `/sitemap-products.xml`.
- Criados dados locais em JSON para reviews e perguntas.
- Criados docs operacionais e validadores.
- Precos recalculados: catalogo grande via overrides e loja CSV com Pix = custo de producao + 30%, cartao = Pix + R$ 1.
- Expansao de 300 itens plugada no catalogo principal e na `/loja`, sem download privado de STLFlix ou uso de marca oficial.

## Lacunas reais restantes

- Reviews e perguntas ainda sao locais/client-side para a loja CSV; moderacao persistente depende de banco/admin.
- Upload do orcamento personalizado valida extensoes no cliente e envia nomes no WhatsApp; upload persistente exige storage.
- Frete por CEP e preco automatico sao estimativas locais; integracao real depende de provedor de frete e regra comercial final.
- Integracao completa Nuvemshop/API foi deixada fora de proposito para nao usar tokens agora.
- Metricas Core Web Vitals precisam de coleta real em producao apos trafego.
- Arquivos STL licenciados de STLFlix dependem de assinatura/credencial do cliente; o repo so guarda metadados e imagens proprias.
