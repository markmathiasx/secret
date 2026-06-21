# Marketplace Verification Gates

Generated at: 2026-06-21T15:49:37.641Z
Branch: codex/visual-fase14-cinematic
Commit: 81fcd335

| Command | Exit code | Duration | Result |
| --- | ---: | ---: | --- |
| `npm run db:generate` | 0 | 2s | PASS |
| `npm run typecheck` | 0 | 15s | PASS |
| `npm run lint:check` | 0 | 7s | PASS |
| `npm run build` | 0 | 74s | PASS |
| `npm run validate:industrial-ui` | 0 | 0s | PASS |
| `npm run validate:auth` | 0 | 0s | PASS |
| `npm run validate:db-storage` | 0 | 0s | PASS |
| `npm run validate:private-routes` | 0 | 0s | PASS |
| `npm run validate:public-regressions` | 0 | 1s | PASS |
| `npm run security:audit` | 0 | 0s | PASS |
| `npm audit --audit-level=low` | 0 | 1s | PASS |

## Evidence tails

### npm run db:generate

Exit code: 0

```text
> mdh-3d-store@2.0.0 db:generate
> node scripts/db-generate.mjs

Prisma schema loaded from prisma\schema.prisma

✔ Generated Prisma Client (v6.19.3) to .\node_modules\@prisma\client in 288ms

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
├ ○ /comprar-na-mdh3d                                                    202 B         270 kB
├ ○ /conta                                                               171 B         526 kB
├ ƒ /conta/pedidos/[id]                                                 7.3 kB         277 kB
├ ○ /contato                                                           3.51 kB         273 kB
├ ○ /decoracao-3d-para-casa                                              139 B         556 kB
├ ○ /devolucoes                                                         6.6 kB         276 kB
├ ○ /divulgacao                                                          742 B         270 kB
├ ○ /entregas                                                          4.03 kB         273 kB
├ ƒ /falha                                                               177 B         277 kB
├ ○ /faq                                                               1.98 kB         271 kB
├ ○ /favoritos                                                         1.56 kB         271 kB
├ ○ /feeds/google-shopping.csv                                           432 B         270 kB          5m      1y
├ ○ /feeds/google-shopping.xml                                           432 B         270 kB          5m      1y
├ ○ /feeds/meta-catalog.csv                                              432 B         270 kB          5m      1y
├ ○ /feeds/products.json                                                 432 B         270 kB          5m      1y
├ ○ /feeds/produtos.json                                                 432 B         270 kB          5m      1y
├ ○ /feeds/tiktok-catalog.csv                                            432 B         270 kB          5m      1y
├ ○ /guia-primeira-impressao-3d                                         2.1 kB         272 kB
├ ○ /imagem-para-impressao-3d                                          6.81 kB         276 kB
├ ○ /indicacao                                                           202 B         270 kB
├ ○ /jogue                                                               18 kB         287 kB
├ ○ /login                                                               162 B         276 kB
├ ○ /loja                                                              6.11 kB         280 kB          5m      1y
├ ● /loja/[categoria]/[slug]                                             135 B         540 kB          5m      1y
├   ├ /loja/casa-e-organizacao/real-001-grinder-3-partes-premium                                       5m      1y
├   ├ /loja/casa-e-organizacao/real-002-porta-creme-dental-de-bancada                                  5m      1y
├   ├ /loja/geek-colecionaveis/real-003-demogorgon-decorativo-premium                                  5m      1y
├   └ [+840 more paths]
├ ○ /manifest.webmanifest                                                432 B         270 kB
├ ○ /merchant/products.xml                                               432 B         270 kB          1h      1y
├ ƒ /meta/catalog.csv                                                    432 B         270 kB
├ ○ /ofertas                                                             202 B         270 kB
├ ○ /orcamento-personalizado                                             124 B         275 kB
├ ○ /organizadores                                                     1.84 kB         271 kB
├ ○ /peca-sob-medida                                                   1.84 kB         271 kB
├ ○ /pedidos                                                             176 B         526 kB
├ ƒ /pedidos/[id]                                                        432 B         270 kB
├ ƒ /pendente                                                            177 B         277 kB
├ ○ /perfil                                                              176 B         526 kB
├ ○ /politica-de-envio                                                   202 B         270 kB
├ ○ /politica-de-privacidade                                             432 B         270 kB
├ ○ /politica-de-troca                                                   202 B         270 kB
├ ○ /prazo-de-producao                                                   202 B         270 kB
├ ○ /presentes-3d                                                        138 B         556 kB
├ ○ /presentes-ate-50                                                  1.84 kB         271 kB
├ ƒ /product/[id]                                                        432 B         270 kB
├ ● /produto/[slug]                                                    3.69 kB         277 kB          5m      1y
├   ├ /produto/chaveiro-goleiro-comercial-copa-2026-copa-001                                           5m      1y
├   ├ /produto/chaveiro-bola-para-presente-copa-2026-copa-002                                          5m      1y
├   ├ /produto/chaveiro-camisa-mini-copa-2026-copa-003                                                 5m      1y
├   └ [+303 more paths]
├ ○ /rastrear                                                          6.09 kB         276 kB
├ ○ /recuperar-senha                                                   1.85 kB         271 kB
├ ƒ /recuperar-senha/confirmar                                           432 B         270 kB
├ ○ /recuperar-senha/whatsapp                                          3.57 kB         273 kB
├ ○ /robots.txt                                                          432 B         270 kB
├ ƒ /seller                                                              202 B         270 kB
├ ○ /setup-e-organizacao-3d                                              139 B         556 kB
├ ○ /setup-gamer                                                       1.84 kB         271 kB
├ ○ /sitemap-products.xml                                                432 B         270 kB          5m      1y
├ ○ /sitemap.xml                                                         432 B         270 kB
├ ○ /sob-medida                                                          124 B         275 kB
├ ○ /sobre                                                               182 B         270 kB
├ ƒ /sucesso                                                           1.06 kB         277 kB
├ ○ /termos                                                              432 B         270 kB
├ ○ /termos-de-compra                                                    202 B         270 kB
└ ○ /trocas-e-devolucoes                                                 432 B         270 kB
+ First Load JS shared by all                                           269 kB
  ├ chunks/4bd1b696-100b9d70ed4e49c1.js                                54.2 kB
  └ chunks/vendors-613547e7638f7fe9.js                                  213 kB
  └ other shared chunks (total)                                        2.27 kB


ƒ Middleware                                                           63.7 kB

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

OK: regressões públicas validadas (843 produtos públicos ativos, 11 jogos).
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
