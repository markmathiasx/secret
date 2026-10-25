BEGIN;

ALTER TABLE mdh_marketplace.orders
  ADD COLUMN IF NOT EXISTS idempotency_key text,
  ADD COLUMN IF NOT EXISTS request_fingerprint text,
  ADD COLUMN IF NOT EXISTS shipping_address jsonb,
  ADD COLUMN IF NOT EXISTS expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

UPDATE mdh_marketplace.orders
SET expires_at = created_at + interval '30 minutes'
WHERE expires_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS orders_user_idempotency_unique
  ON mdh_marketplace.orders(user_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE TABLE IF NOT EXISTS mdh_marketplace.order_items (
  order_id uuid NOT NULL REFERENCES mdh_marketplace.orders(id) ON DELETE RESTRICT,
  product_id uuid NOT NULL REFERENCES mdh_marketplace.products(id) ON DELETE RESTRICT,
  seller_id text NOT NULL REFERENCES mdh_marketplace.users(id) ON DELETE RESTRICT,
  title text NOT NULL,
  unit_price_cents integer NOT NULL CHECK(unit_price_cents BETWEEN 1 AND 100000000),
  quantity integer NOT NULL CHECK(quantity BETWEEN 1 AND 99),
  availability_mode text NOT NULL CHECK(availability_mode IN ('in_stock','made_to_order')),
  PRIMARY KEY(order_id, product_id)
);

CREATE INDEX IF NOT EXISTS order_items_seller
  ON mdh_marketplace.order_items(seller_id, order_id);

CREATE TABLE IF NOT EXISTS mdh_marketplace.payments (
  id uuid PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES mdh_marketplace.orders(id) ON DELETE RESTRICT,
  user_id text NOT NULL REFERENCES mdh_marketplace.users(id) ON DELETE RESTRICT,
  provider text NOT NULL CHECK(provider = 'mercado_pago'),
  method text NOT NULL CHECK(method = 'pix'),
  status text NOT NULL CHECK(status IN ('creating','pending','approved','rejected','cancelled','refunded','charged_back','failed')),
  provider_status text,
  provider_payment_id text,
  idempotency_key text NOT NULL,
  request_fingerprint text NOT NULL,
  amount_cents bigint NOT NULL CHECK(amount_cents BETWEEN 1 AND 9007199254740991),
  collector_id text NOT NULL,
  live_mode boolean NOT NULL,
  qr_code text,
  qr_code_base64 text,
  expires_at timestamptz NOT NULL,
  failure_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT payments_user_idempotency_unique UNIQUE(user_id, idempotency_key)
);

CREATE UNIQUE INDEX IF NOT EXISTS payments_provider_id_unique
  ON mdh_marketplace.payments(provider, provider_payment_id)
  WHERE provider_payment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS payments_order_created
  ON mdh_marketplace.payments(order_id, created_at DESC);

CREATE TABLE IF NOT EXISTS mdh_marketplace.payment_webhook_events (
  id uuid PRIMARY KEY,
  provider text NOT NULL CHECK(provider = 'mercado_pago'),
  request_id text NOT NULL,
  data_id text NOT NULL,
  payment_id uuid REFERENCES mdh_marketplace.payments(id) ON DELETE RESTRICT,
  outcome text NOT NULL CHECK(outcome IN ('ignored','processed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT payment_webhook_request_unique UNIQUE(provider, request_id)
);

COMMIT;
