BEGIN;

ALTER TABLE mdh_marketplace.products
  ADD COLUMN IF NOT EXISTS availability_mode text,
  ADD COLUMN IF NOT EXISTS production_window text,
  ADD COLUMN IF NOT EXISTS material text,
  ADD COLUMN IF NOT EXISTS finish text,
  ADD COLUMN IF NOT EXISTS dimensions text,
  ADD COLUMN IF NOT EXISTS image_alt text;

UPDATE mdh_marketplace.products
SET availability_mode = CASE WHEN stock > 0 THEN 'in_stock' ELSE 'out_of_stock' END
WHERE availability_mode IS NULL;

ALTER TABLE mdh_marketplace.products
  ALTER COLUMN availability_mode SET DEFAULT 'out_of_stock',
  ALTER COLUMN availability_mode SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'products_availability_mode_check'
      AND conrelid = 'mdh_marketplace.products'::regclass
  ) THEN
    ALTER TABLE mdh_marketplace.products
      ADD CONSTRAINT products_availability_mode_check
      CHECK (availability_mode IN ('in_stock', 'made_to_order', 'out_of_stock'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS products_availability_filter
  ON mdh_marketplace.products(availability_mode, id)
  WHERE published;

COMMIT;
