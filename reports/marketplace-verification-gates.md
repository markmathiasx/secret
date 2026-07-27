# Marketplace Verification Gates

Generated at: 2026-07-27T10:00:37.918Z
Branch: industrial-ai-v62-20260727-005340
Commit: 09ecfa94

| Command | Exit code | Duration | Result |
| --- | ---: | ---: | --- |
| `npm run db:generate` | 0 | 2s | PASS |
| `npm run typecheck` | 0 | 4s | PASS |
| `npm run lint:check` | 0 | 8s | PASS |
| `npm run build` | 0 | 110s | PASS |
| `npm run validate:industrial-ui` | 0 | 0s | PASS |
| `npm run validate:auth` | 0 | 0s | PASS |
| `npm run validate:db-storage` | 0 | 0s | PASS |
| `npm run validate:private-routes` | 0 | 0s | PASS |
| `npm run validate:public-regressions` | 0 | 1s | PASS |
| `npm run security:audit` | 0 | 1s | PASS |
| `npm audit --audit-level=low` | 0 | 1s | PASS |

## Evidence tails

### npm run db:generate

Exit code: 0

```text
> mdh-3d-store@2.0.0 db:generate
> node scripts/db-generate.mjs

Prisma schema loaded from prisma\schema.prisma

✔ Generated Prisma Client (v6.19.3) to .\node_modules\@prisma\client in 409ms

Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)

Tip: Need your database queries to be 1000x faster? Accelerate offers you that and more: https://pris.ly/tip-2-accelerate
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
├ ○ /colecionaveis-geek-3d                                            472 B         226 kB
├ ○ /como-funciona                                                  2.74 kB         109 kB
├ ○ /compra-protegida                                                2.5 kB         113 kB
├ ○ /comprar-na-mdh3d                                                 207 B         106 kB
├ ○ /conta                                                            185 B         147 kB
├ ƒ /conta/pedidos/[id]                                             5.27 kB         122 kB
├ ○ /contato                                                        4.11 kB         107 kB
├ ○ /decoracao-3d-para-casa                                           472 B         226 kB
├ ○ /devolucoes                                                     4.31 kB         115 kB
├ ○ /divulgacao                                                     1.39 kB         107 kB
├ ○ /entregas                                                       3.98 kB         117 kB
├ ƒ /falha                                                            858 B         122 kB
├ ○ /faq                                                            2.99 kB         109 kB
├ ○ /favoritos                                                      2.16 kB         108 kB
├ ○ /feeds/google-shopping.csv                                        504 B         103 kB          5m      1y
├ ○ /feeds/google-shopping.xml                                        504 B         103 kB          5m      1y
├ ○ /feeds/meta-catalog.csv                                           504 B         103 kB          5m      1y
├ ○ /feeds/products.json                                              504 B         103 kB          5m      1y
├ ○ /feeds/produtos.json                                              504 B         103 kB          5m      1y
├ ○ /feeds/tiktok-catalog.csv                                         504 B         103 kB          5m      1y
├ ○ /guia-primeira-impressao-3d                                     2.74 kB         109 kB
├ ○ /imagem-para-impressao-3d                                       8.07 kB         114 kB
├ ○ /indicacao                                                        207 B         106 kB
├ ○ /jogue                                                            21 kB         124 kB
├ ○ /login                                                            167 B         114 kB
├ ○ /loja                                                             504 B         103 kB
├ ƒ /loja/[categoria]/[slug]                                          504 B         103 kB
├ ○ /manifest.webmanifest                                             504 B         103 kB
├ ○ /merchant/products.xml                                            504 B         103 kB          1h      1y
├ ƒ /meta/catalog.csv                                                 504 B         103 kB
├ ○ /ofertas                                                          207 B         106 kB
├ ○ /orcamento-personalizado                                          135 B         119 kB
├ ○ /organizadores                                                   2.2 kB         113 kB
├ ○ /peca-sob-medida                                                 2.2 kB         113 kB
├ ○ /pedidos                                                          189 B         147 kB
├ ƒ /pedidos/[id]                                                     504 B         103 kB
├ ƒ /pendente                                                         858 B         122 kB
├ ○ /perfil                                                           189 B         147 kB
├ ○ /politica-de-envio                                                207 B         106 kB
├ ○ /politica-de-privacidade                                          504 B         103 kB
├ ○ /politica-de-troca                                                207 B         106 kB
├ ○ /prazo-de-producao                                                207 B         106 kB
├ ○ /presentes-3d                                                     472 B         226 kB
├ ○ /presentes-ate-50                                                2.2 kB         113 kB
├ ○ /preview/neoglass-2026                                          9.21 kB         120 kB          5m      1y
├ ƒ /product/[id]                                                     504 B         103 kB
├ ● /produto/[slug]                                                 5.54 kB         122 kB          5m      1y
├   ├ /produto/chaveiro-goleiro-comercial-copa-2026-copa-001                                        5m      1y
├   ├ /produto/chaveiro-bola-para-presente-copa-2026-copa-002                                       5m      1y
├   ├ /produto/chaveiro-camisa-mini-copa-2026-copa-003                                              5m      1y
├   └ [+303 more paths]
├ ○ /rastrear                                                       3.32 kB         114 kB
├ ○ /recuperar-senha                                                2.42 kB         108 kB
├ ƒ /recuperar-senha/confirmar                                        504 B         103 kB
├ ○ /recuperar-senha/whatsapp                                        4.4 kB         110 kB
├ ○ /robots.txt                                                       504 B         103 kB
├ ƒ /seller                                                           207 B         106 kB
├ ○ /setup-e-organizacao-3d                                           472 B         226 kB
├ ○ /setup-gamer                                                     2.2 kB         113 kB
├ ○ /sitemap-products.xml                                             504 B         103 kB          5m      1y
├ ○ /sitemap.xml                                                      504 B         103 kB
├ ○ /sob-medida                                                       135 B         119 kB
├ ○ /sobre                                                            184 B         111 kB
├ ƒ /sucesso                                                        1.08 kB         124 kB
├ ○ /termos                                                           504 B         103 kB
├ ○ /termos-de-compra                                                 207 B         106 kB
└ ○ /trocas-e-devolucoes                                              504 B         103 kB
+ First Load JS shared by all                                        103 kB
  ├ chunks/1255-f5767ca0d1da046a.js                                   46 kB
  ├ chunks/4bd1b696-100b9d70ed4e49c1.js                             54.2 kB
  └ other shared chunks (total)                                      2.3 kB


ƒ Middleware                                                        63.9 kB

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

OK: regressões públicas validadas (12 produtos públicos ativos, 11 jogos).
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
