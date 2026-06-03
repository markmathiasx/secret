# Restore good state audit

Date: 2026-06-03
Branch: `fix/restore-good-32c3606-with-arcade-883ccb0`

## Target state

- Pricing/catalog/security/general baseline restored from `32c3606 fix: ajustar preços jogo e segurança`.
- Arcade route restored from `883ccb0 fix: restaurar arcade completo com pinball`.
- Pricing policy enforced across the public catalog: Pix is the base piece value and card is Pix + R$ 1.00.
- Public copy cleanup applied for old installment/photo/render terms, old Instagram handle, and blocked trademark terms in generated HTML.

## Implementation summary

- Restored catalog, pricing, admin, security middleware, validation scripts, PWA/SEO/UX support files, and static storefront config from the good baseline.
- Restored `/jogue` arcade with Pinball Star, Print Runner, and 9 mini-games.
- Reinforced game keyboard handling so `Space` and arrow keys do not scroll the browser while a game is active.
- Restored PWA shortcuts for `/catalogo`, WhatsApp/atendimento, `/jogue`, and `/carrinho`.
- Corrected Instagram references to `@mdh_3d.com.br` and `https://www.instagram.com/mdh_3d.com.br/`.
- Added public sanitization for blocked copy/trademark terms before catalog HTML generation.

## Local validation

- `npm install`: up to date, 0 vulnerabilities.
- `npm run security:audit`: OK, no critical findings.
- `npm run catalog:validate-card-prices`: OK, 564 products with card = Pix + R$ 1.00.
- `npm run catalog:validate-pricing`: OK, 564 products inside Pix-base/card-plus-1 policy.
- `npm run catalog:validate-public-copy`: OK, 331 public files without forbidden copy.
- `npm run catalog:validate-card-images`: OK, 559 public cards with own image or placeholder.
- `npm run meta:validate-feed`: OK, Meta feed with 560 products and 4 skipped.
- `npm run seo:validate`: OK.
- `npm run pwa:validate`: OK.
- `npm run ux:validate`: OK.
- `npm run typecheck`: OK.
- `npm run lint:check`: OK.
- `npm run build`: OK, 1232 static pages generated.
- `npm run validate:public-html`: OK for local build.
- `git diff --check`: OK.

## Browser validation

- `http://127.0.0.1:3000/`: loaded, no forbidden public copy, `Cartão + R$ 1`, `@mdh_3d.com.br`, and `Jogue no site` present.
- `http://127.0.0.1:3000/catalogo`: loaded, 18 visible product cards in initial grid, no forbidden public copy, Pix/card/WhatsApp/buy signals present.
- `http://127.0.0.1:3000/jogue`: loaded, 11 game cards, no forbidden public copy, no console errors.
- Active game keyboard test: `Space` scroll delta = 0 with `print-runner` active.

## Notes

- Local standalone startup still reports expected missing local production secrets for Auth/Mercado Pago/Database/Email, but pages respond locally and build validations pass.
- Production validation is performed after merge and Vercel production deployment because the live domains can only reflect this branch after publish.
