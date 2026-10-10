BEGIN;

ALTER TABLE mdh_marketplace.products
  ADD COLUMN IF NOT EXISTS legacy_id text,
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS product_type text,
  ADD COLUMN IF NOT EXISTS game text,
  ADD COLUMN IF NOT EXISTS character_name text,
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS media_commercial_use text
    CHECK (media_commercial_use IN ('verified', 'review-required'));

CREATE UNIQUE INDEX IF NOT EXISTS products_legacy_id_unique
  ON mdh_marketplace.products(legacy_id)
  WHERE legacy_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS products_type_filter
  ON mdh_marketplace.products(product_type, id)
  WHERE published;
CREATE INDEX IF NOT EXISTS products_game_filter
  ON mdh_marketplace.products(game, character_name, id)
  WHERE published;

COMMIT;
