BEGIN;
CREATE SCHEMA IF NOT EXISTS mdh_marketplace;
CREATE TABLE IF NOT EXISTS mdh_marketplace.users (
 id text PRIMARY KEY, email text, role text NOT NULL DEFAULT 'buyer' CHECK(role IN ('buyer','seller','admin')), disabled boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS mdh_marketplace.categories(id uuid PRIMARY KEY, name text NOT NULL);
CREATE TABLE IF NOT EXISTS mdh_marketplace.products(
 id uuid PRIMARY KEY, seller_id text NOT NULL REFERENCES mdh_marketplace.users(id), category_id uuid NOT NULL REFERENCES mdh_marketplace.categories(id), title text NOT NULL, description text NOT NULL DEFAULT '', price_cents integer NOT NULL CHECK(price_cents BETWEEN 1 AND 100000000), stock integer NOT NULL DEFAULT 0 CHECK(stock BETWEEN 0 AND 1000000), image_url text NOT NULL, model_url text, published boolean NOT NULL DEFAULT false, updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS products_category_id ON mdh_marketplace.products(category_id,id) WHERE published;
CREATE TABLE IF NOT EXISTS mdh_marketplace.cart_items(user_id text NOT NULL REFERENCES mdh_marketplace.users(id), product_id uuid NOT NULL REFERENCES mdh_marketplace.products(id), quantity integer NOT NULL CHECK(quantity BETWEEN 1 AND 99), PRIMARY KEY(user_id,product_id));
CREATE TABLE IF NOT EXISTS mdh_marketplace.addresses(id uuid PRIMARY KEY, user_id text NOT NULL REFERENCES mdh_marketplace.users(id), recipient text NOT NULL, postal_code text NOT NULL, street text NOT NULL, number text NOT NULL, complement text NOT NULL DEFAULT '', district text NOT NULL DEFAULT '', city text NOT NULL, state text NOT NULL);
CREATE INDEX IF NOT EXISTS addresses_user ON mdh_marketplace.addresses(user_id);
CREATE TABLE IF NOT EXISTS mdh_marketplace.orders(id uuid PRIMARY KEY,user_id text NOT NULL REFERENCES mdh_marketplace.users(id),status text NOT NULL CHECK(status IN ('pending','paid','preparing','shipped','delivered','cancelled','refunded')),total_cents bigint NOT NULL CHECK(total_cents BETWEEN 0 AND 9007199254740991),created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS orders_user ON mdh_marketplace.orders(user_id,created_at DESC);
CREATE TABLE IF NOT EXISTS mdh_marketplace.audit_log(id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,actor_id text NOT NULL REFERENCES mdh_marketplace.users(id),action text NOT NULL,entity_id text NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
COMMIT;
