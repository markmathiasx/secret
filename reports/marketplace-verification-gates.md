# Marketplace Verification Gates

Generated at: 2026-06-19T05:35:47.286Z
Branch: codex/marketplace-phase0-protocol
Commit: 266d6865

| Command | Exit code | Duration | Result |
| --- | ---: | ---: | --- |
| `npm run db:generate` | 0 | 2s | PASS |
| `npm run typecheck` | 0 | 3s | PASS |
| `npm run lint:check` | 0 | 8s | PASS |
| `npm run build` | 0 | 79s | PASS |
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

✔ Generated Prisma Client (v6.19.3) to .\node_modules\@prisma\client in 286ms

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
├ ƒ /checkout/sucesso                                                    177 B         276 kB
├ ○ /colecionaveis-geek-3d                                               141 B         556 kB
├ ○ /compra-protegida                                                  4.98 kB         274 kB
├ ○ /comprar-na-mdh3d                                                    202 B         269 kB
├ ○ /conta                                                               171 B         526 kB
├ ƒ /conta/pedidos/[id]                                                7.27 kB         276 kB
├ ○ /contato                                                           3.47 kB         273 kB
├ ○ /decoracao-3d-para-casa                                              141 B         556 kB
├ ○ /devolucoes                                                        6.57 kB         276 kB
├ ○ /divulgacao                                                          742 B         270 kB
├ ○ /entregas                                                             4 kB         273 kB
├ ƒ /falha                                                               177 B         276 kB
├ ○ /faq                                                               1.98 kB         271 kB
├ ○ /favoritos                                                         1.56 kB         271 kB
├ ○ /feeds/google-shopping.xml                                           420 B         270 kB          5m      1y
├ ○ /feeds/meta-catalog.csv                                              420 B         270 kB          5m      1y
├ ○ /feeds/produtos.json                                                 420 B         270 kB          5m      1y
├ ○ /feeds/tiktok-catalog.csv                                            420 B         270 kB          5m      1y
├ ○ /guia-primeira-impressao-3d                                         2.1 kB         271 kB
├ ○ /imagem-para-impressao-3d                                          6.78 kB         276 kB
├ ○ /indicacao                                                           202 B         269 kB
├ ○ /jogue                                                               18 kB         287 kB
├ ○ /login                                                               162 B         276 kB
├ ○ /loja                                                              6.04 kB         279 kB          5m      1y
├ ● /loja/[categoria]/[slug]                                             138 B         541 kB          5m      1y
├   ├ /loja/casa-e-organizacao/real-001-grinder-3-partes-premium                                       5m      1y
├   ├ /loja/casa-e-organizacao/real-002-porta-creme-dental-de-bancada                                  5m      1y
├   ├ /loja/geek-colecionaveis/real-003-demogorgon-decorativo-premium                                  5m      1y
├   └ [+840 more paths]
├ ○ /manifest.webmanifest                                                420 B         270 kB
├ ○ /merchant/products.xml                                               420 B         270 kB          1h      1y
├ ƒ /meta/catalog.csv                                                    420 B         270 kB
├ ○ /ofertas                                                             202 B         269 kB
├ ○ /orcamento-personalizado                                           5.22 kB         274 kB
├ ○ /organizadores                                                     1.85 kB         271 kB
├ ○ /peca-sob-medida                                                   1.85 kB         271 kB
├ ○ /pedidos                                                             176 B         526 kB
├ ƒ /pedidos/[id]                                                        420 B         270 kB
├ ƒ /pendente                                                            177 B         276 kB
├ ○ /perfil                                                              176 B         526 kB
├ ○ /politica-de-envio                                                   202 B         269 kB
├ ○ /politica-de-privacidade                                             420 B         270 kB
├ ○ /politica-de-troca                                                   202 B         269 kB
├ ○ /prazo-de-producao                                                   202 B         269 kB
├ ○ /presentes-3d                                                        140 B         556 kB
├ ○ /presentes-ate-50                                                  1.85 kB         271 kB
├ ƒ /product/[id]                                                        420 B         270 kB
├ ● /produto/[slug]                                                    3.58 kB         277 kB          5m      1y
├   ├ /produto/chaveiro-goleiro-comercial-copa-2026-copa-001                                           5m      1y
├   ├ /produto/chaveiro-bola-para-presente-copa-2026-copa-002                                          5m      1y
├   ├ /produto/chaveiro-camisa-mini-copa-2026-copa-003                                                 5m      1y
├   └ [+303 more paths]
├ ○ /rastrear                                                          6.06 kB         275 kB
├ ○ /recuperar-senha                                                   1.85 kB         271 kB
├ ƒ /recuperar-senha/confirmar                                           420 B         270 kB
├ ○ /recuperar-senha/whatsapp                                          3.57 kB         273 kB
├ ○ /robots.txt                                                          420 B         270 kB
├ ƒ /seller                                                              202 B         269 kB
├ ○ /setup-e-organizacao-3d                                              141 B         556 kB
├ ○ /setup-gamer                                                       1.85 kB         271 kB
├ ○ /sitemap-products.xml                                                420 B         270 kB          5m      1y
├ ○ /sitemap.xml                                                         420 B         270 kB
├ ○ /sobre                                                               182 B         269 kB
├ ƒ /sucesso                                                           1.06 kB         277 kB
├ ○ /termos                                                              420 B         270 kB
├ ○ /termos-de-compra                                                    202 B         269 kB
└ ○ /trocas-e-devolucoes                                                 420 B         270 kB
+ First Load JS shared by all                                           269 kB
  ├ chunks/4bd1b696-100b9d70ed4e49c1.js                                54.2 kB
  └ chunks/vendors-c8178a0819573c27.js                                  213 kB
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

OK: regressões públicas validadas (848 produtos, 11 jogos).
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
