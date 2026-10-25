# Marketplace Verification Gates

Generated at: 2026-10-25T05:19:07.134Z
Branch: industrial-ai-v62-20260727-005340
Commit: 4b8bfdc1

| Command | Exit code | Duration | Result |
| --- | ---: | ---: | --- |
| `npm run db:generate` | 0 | 3s | PASS |
| `npm run typecheck` | 0 | 6s | PASS |
| `npm run lint:check` | 0 | 12s | PASS |
| `npm run build` | 0 | 148s | PASS |
| `npm run validate:industrial-ui` | 0 | 0s | PASS |
| `npm run validate:auth` | 0 | 0s | PASS |
| `npm run validate:db-storage` | 0 | 0s | PASS |
| `npm run validate:private-routes` | 0 | 0s | PASS |
| `npm run validate:public-regressions` | 0 | 2s | PASS |
| `npm run security:audit` | 0 | 1s | PASS |
| `npm audit --audit-level=low` | 0 | 1s | PASS |

## Evidence tails

### npm run db:generate

Exit code: 0

```text
> mdh-3d-store@2.0.0 db:generate
> node scripts/db-generate.mjs

Prisma schema loaded from prisma\schema.prisma

✔ Generated Prisma Client (v6.19.3) to .\node_modules\@prisma\client in 598ms

Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)

Tip: Interested in query caching in just a few lines of code? Try Accelerate today! https://pris.ly/tip-3-accelerate
```

### npm run typecheck

Exit code: 0

```text
> mdh-3d-store@2.0.0 typecheck
> node scripts/typecheck.mjs
```

### npm run lint:check

Exit code: 0

```text
> mdh-3d-store@2.0.0 lint:check
> node scripts/lint.mjs
```

### npm run build

Exit code: 0

```text
├ ƒ /checkout/falha                                       189 B         122 kB
├ ƒ /checkout/pendente                                    189 B         122 kB
├ ○ /checkout/success                                     500 B         103 kB
├ ƒ /checkout/sucesso                                     189 B         122 kB
├ ○ /colecionaveis-geek-3d                                765 B         201 kB
├ ○ /como-funciona                                        128 B         110 kB
├ ○ /compra-protegida                                   6.52 kB         113 kB
├ ○ /comprar-na-mdh3d                                     195 B         106 kB
├ ○ /conta                                                187 B         147 kB
├ ƒ /conta/pedidos/[id]                                 9.16 kB         122 kB
├ ○ /contato                                            3.85 kB         107 kB
├ ○ /decoracao-3d-para-casa                               765 B         201 kB
├ ○ /devolucoes                                         8.43 kB         115 kB
├ ○ /divulgacao                                          2.5 kB         109 kB
├ ○ /entregas                                           2.62 kB         116 kB
├ ƒ /falha                                                189 B         122 kB
├ ○ /faq                                                4.18 kB         110 kB
├ ○ /favoritos                                          3.24 kB         109 kB
├ ○ /feeds/google-shopping.csv                            500 B         103 kB          5m      1y
├ ○ /feeds/google-shopping.xml                            500 B         103 kB          5m      1y
├ ○ /feeds/meta-catalog.csv                               500 B         103 kB          5m      1y
├ ○ /feeds/products.json                                  500 B         103 kB          5m      1y
├ ○ /feeds/produtos.json                                  500 B         103 kB          5m      1y
├ ○ /feeds/tiktok-catalog.csv                             500 B         103 kB          5m      1y
├ ○ /guia-primeira-impressao-3d                           128 B         110 kB
├ ○ /imagem-para-impressao-3d                           8.18 kB         114 kB
├ ○ /indicacao                                           1.5 kB         108 kB
├ ○ /jogue                                              20.3 kB         126 kB
├ ○ /login                                                171 B         117 kB
├ ○ /loja                                                 500 B         103 kB
├ ƒ /loja/[categoria]/[slug]                              500 B         103 kB
├ ○ /manifest.webmanifest                                 500 B         103 kB
├ ○ /merchant/products.xml                                500 B         103 kB          1h      1y
├ ƒ /meta/catalog.csv                                     500 B         103 kB
├ ○ /ofertas                                             1.5 kB         108 kB
├ ○ /orcamento-personalizado                              132 B         119 kB
├ ○ /organizadores                                        133 B         115 kB
├ ○ /peca-sob-medida                                      133 B         115 kB
├ ○ /pedidos                                              192 B         147 kB
├ ƒ /pedidos/[id]                                         500 B         103 kB
├ ƒ /pendente                                             189 B         122 kB
├ ○ /perfil                                               192 B         147 kB
├ ○ /politica-de-envio                                    195 B         106 kB
├ ○ /politica-de-privacidade                              500 B         103 kB
├ ○ /politica-de-troca                                    195 B         106 kB
├ ○ /prazo-de-producao                                    195 B         106 kB
├ ○ /presentes-3d                                         765 B         201 kB
├ ○ /presentes-ate-50                                     132 B         115 kB
├ ○ /preview/neoglass-2026                              8.09 kB         122 kB          5m      1y
├ ƒ /product/[id]                                         500 B         103 kB
├ ƒ /produto/[slug]                                       500 B         103 kB
├ ○ /rastrear                                           7.44 kB         114 kB
├ ○ /recuperar-senha                                    3.58 kB         110 kB
├ ƒ /recuperar-senha/confirmar                            500 B         103 kB
├ ○ /recuperar-senha/whatsapp                           5.56 kB         112 kB
├ ○ /robots.txt                                           500 B         103 kB
├ ƒ /seller                                               195 B         106 kB
├ ○ /setup-e-organizacao-3d                               765 B         201 kB
├ ○ /setup-gamer                                          133 B         115 kB
├ ○ /sitemap-products.xml                                 500 B         103 kB          5m      1y
├ ○ /sitemap.xml                                          500 B         103 kB
├ ○ /sob-medida                                           132 B         119 kB
├ ○ /sobre                                                178 B         112 kB
├ ƒ /sucesso                                               2 kB         124 kB
├ ○ /termos                                               500 B         103 kB
├ ○ /termos-de-compra                                     195 B         106 kB
└ ○ /trocas-e-devolucoes                                  500 B         103 kB
+ First Load JS shared by all                            103 kB
  ├ chunks/1255-60d8dc7c8c9309a1.js                     46.3 kB
  ├ chunks/4bd1b696-100b9d70ed4e49c1.js                 54.2 kB
  └ other shared chunks (total)                         2.27 kB


ƒ Middleware                                            88.4 kB

○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses generateStaticParams)
ƒ  (Dynamic)  server-rendered on demand
```

### npm run validate:industrial-ui

Exit code: 0

```text
> mdh-3d-store@2.0.0 validate:industrial-ui
> node scripts/validate-industrial-ui.mjs

OK: fundacao visual industrial validada.
```

### npm run validate:auth

Exit code: 0

```text
> mdh-3d-store@2.0.0 validate:auth
> node scripts/validate-auth-flow.mjs

OK: fluxo de auth validado.
```

### npm run validate:db-storage

Exit code: 0

```text
> mdh-3d-store@2.0.0 validate:db-storage
> node scripts/validate-db-storage.mjs

OK: DB/storage validado.
```

### npm run validate:private-routes

Exit code: 0

```text
> mdh-3d-store@2.0.0 validate:private-routes
> node scripts/validate-private-routes.mjs

OK: rotas privadas validadas.
```

### npm run validate:public-regressions

Exit code: 0

```text
> mdh-3d-store@2.0.0 validate:public-regressions
> node scripts/validate-public-regressions.mjs

OK: regressões públicas validadas (538 produtos públicos ativos, 11 jogos).
```

### npm run security:audit

Exit code: 0

```text
> mdh-3d-store@2.0.0 security:audit
> node scripts/security/audit-security.mjs

OK: auditoria de seguranca sem achados criticos.
```

### npm audit --audit-level=low

Exit code: 0

```text
found 0 vulnerabilities
```
