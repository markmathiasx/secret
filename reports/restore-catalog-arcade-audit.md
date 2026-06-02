# Restore catalog values and arcade audit

Date: 2026-06-02
Branch: `fix/restore-catalog-values-and-arcade-pinball`

## Current main

- Current main commit: `e52ed5a fix: alinhar precos do catalogo`
- Working tree before restore: clean

## Commit `e52ed5a` changed

`e52ed5a` changed 23 files and is treated as the suspected pricing/catalog regression commit.

- `app/admin/finance/page.tsx`
- `app/api/admin/catalog/[id]/route.ts`
- `app/api/admin/products/[id]/route.ts`
- `app/api/products/[slug]/price/route.ts`
- `components/admin/admin-dashboard.tsx`
- `components/admin/admin-product-edit-form.tsx`
- `components/product-price-stack.tsx`
- `components/product-purchase-tools.tsx`
- `components/product/PremiumCard.tsx`
- `data/admin-product-overrides.json`
- `data/products.json`
- `lib/a1-mini-expansion-catalog.ts`
- `lib/catalog-csv-curated.ts`
- `lib/catalog.ts`
- `lib/market-pricing.ts`
- `lib/pricing-engine.ts`
- `lib/products.ts`
- `lib/server/admin-catalog-store.ts`
- `public/assets/js/app.js`
- `public/assets/js/products.js`
- `scripts/generate-all-images-prompts.ts`
- `scripts/regenerate_catalog_from_images.js`
- `types/admin-catalog.ts`

## Commit `883ccb0` changed

`883ccb0` restored the arcade state and added the keyboard guard / mini-game hub.

- `app/jogue/page.tsx`
- `components/game/GameKeyboardGuard.tsx`
- `components/game/MiniGames.tsx`
- `components/game/PrintRunner.tsx`
- `components/games/ArcadeHub.tsx`
- `package-lock.json`

## Current catalog signals before restore

- `data/products.json`: 220 products, 16 Pix prices exactly `R$ 4,50`, 23 prices at or below `R$ 6,00`, 126 unique Pix prices, range `R$ 4,50` to `R$ 36,18`.
- `data/admin-product-overrides.json`: 248 override entries, 4 prices exactly `R$ 4,50`, 44 prices at or below `R$ 6,00`, range `R$ 4,50` to `R$ 22,76`.
- UI/source text occurrences before restore: `Cartão + R$ 1` appears 4 times; `Cartão + R$ 3` appears 0 times.
- This confirms `e52ed5a` introduced the `Cartão + R$ 1` rule and reduced catalog values.

## Current arcade signals before restore

- `/jogue` source has 11 active games:
  - `Pinball Star`
  - `Print Runner 3D`
  - `Filament Catcher`
  - `Layer Stack`
  - `Nozzle Dodge`
  - `Bed Level Master`
  - `Support Breaker`
  - `Color Swap`
  - `Delivery Dash 3D`
  - `STL Puzzle`
  - `Print Tycoon Mini`
- `components/games/PinballStar.tsx` exists.
- `components/game/GameKeyboardGuard.tsx` exists.
- No restore action should touch `/jogue`, `components/game`, or `components/games` unless a later validation proves they regressed.

## Restore applied

Restored the files changed by `e52ed5a` back to `e52ed5a^`, without restoring or touching `/jogue`, `components/game`, or `components/games`.

Then applied the project pricing rule requested in this recovery:

- Pix values remain restored/original.
- Derived card price is now `Pix + R$ 3,00`.
- `Cartão + R$ 1` was removed.
- Mass `R$ 4,50` reduction was removed.

Post-restore catalog data checks:

- `data/products.json`: 220 products, 0 Pix prices exactly `R$ 4,50`, 0 prices at or below `R$ 6,00`, and 0 card-price violations against `Pix + R$ 3`.
- `data/admin-product-overrides.json`: 248 override entries, 0 Pix prices exactly `R$ 4,50`, 0 prices at or below `R$ 6,00`, and 0 card-price violations against `Pix + R$ 3`.

## Follow-up fixes from validation

Local browser validation exposed two runtime issues after the catalog restore:

- `SafeBackgroundVideo` used a client reduced-motion hook to decide between poster and video, creating a React hydration mismatch when the browser preferred reduced motion. It now renders a deterministic DOM tree and uses CSS `motion-reduce` classes for the visual behavior.
- The cart Zustand store could hydrate persisted local data before the first client render. It now uses manual hydration (`skipHydration`) through `CartProvider`.
- `/jogue` still scrolled when Space was pressed inside Pinball in the browser automation test. The game view now locks page scroll while an active game is open, and `GameKeyboardGuard` pins the viewport after Space/arrow key events.

## Local validation after fixes

- `npm run typecheck`: passed.
- `npm run lint:check`: passed.
- `git diff --check`: passed.
- `npm run build`: passed, including `/catalogo` and `/jogue`.
- Local `/catalogo`: 559 public products, varied restored prices, `Cartão + R$ 3` present, `Cartão + R$ 1` absent, `R$ 4,50` absent from visible catalog text, console warnings/errors absent after navigation.
- Local `/jogue`: 11 active cards, all requested games present, 0 `EM BREVE`, Pinball Star opens, Arcade back button returns to hub, Space key scroll delta `0`, console warnings/errors absent after navigation.
