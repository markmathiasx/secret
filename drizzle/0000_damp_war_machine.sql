CREATE TYPE "public"."contact_preference" AS ENUM('whatsapp', 'email', 'phone');--> statement-breakpoint
CREATE TYPE "public"."image_status" AS ENUM('pending', 'imported', 'placeholder', 'failed');--> statement-breakpoint
CREATE TYPE "public"."operational_status" AS ENUM('new_order', 'waiting_payment', 'payment_confirmed', 'preparing_model', 'in_production', 'completed', 'shipped', 'delivered', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."order_event_type" AS ENUM('order_created', 'payment_status_changed', 'operational_status_changed', 'note_added', 'manual_order_created', 'payment_reference_created', 'payment_webhook_received', 'customer_updated');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('pix', 'card', 'cash', 'other');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'waiting_proof', 'paid', 'declined', 'canceled', 'refunded');--> statement-breakpoint
CREATE TABLE "addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"postal_code" varchar(16) NOT NULL,
	"street" varchar(180) NOT NULL,
	"number" varchar(20) NOT NULL,
	"complement" varchar(120),
	"reference" varchar(160),
	"neighborhood" varchar(120) NOT NULL,
	"city" varchar(120) NOT NULL,
	"state" varchar(2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"author" varchar(160) NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(160) NOT NULL,
	"session_token_hash" varchar(128) NOT NULL,
	"ip_address" varchar(80),
	"user_agent" text,
	"expires_at" timestamp with time zone NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "catalog_image_mappings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" varchar(64) NOT NULL,
	"provider" varchar(80) NOT NULL,
	"source_url" text NOT NULL,
	"local_path" varchar(255),
	"query" varchar(255),
	"status" "image_status" DEFAULT 'pending' NOT NULL,
	"is_primary" boolean DEFAULT true NOT NULL,
	"downloaded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar(160) NOT NULL,
	"whatsapp" varchar(32) NOT NULL,
	"email" varchar(160),
	"contact_preference" "contact_preference" DEFAULT 'whatsapp' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"event_type" "order_event_type" NOT NULL,
	"description" text NOT NULL,
	"previous_operational_status" "operational_status",
	"next_operational_status" "operational_status",
	"previous_payment_status" "payment_status",
	"next_payment_status" "payment_status",
	"admin_session_id" uuid,
	"admin_actor" varchar(160),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" varchar(64),
	"product_name" varchar(180) NOT NULL,
	"sku" varchar(60) NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price_pix" numeric(10, 2) NOT NULL,
	"unit_price_card" numeric(10, 2) NOT NULL,
	"line_total_pix" numeric(10, 2) NOT NULL,
	"line_total_card" numeric(10, 2) NOT NULL,
	"image_path" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" varchar(32) NOT NULL,
	"customer_id" uuid NOT NULL,
	"address_id" uuid,
	"source_channel_id" varchar(40) NOT NULL,
	"operational_status" "operational_status" DEFAULT 'new_order' NOT NULL,
	"payment_status" "payment_status" DEFAULT 'pending' NOT NULL,
	"payment_method" "payment_method" DEFAULT 'pix' NOT NULL,
	"subtotal_pix" numeric(10, 2) NOT NULL,
	"subtotal_card" numeric(10, 2) NOT NULL,
	"shipping_amount" numeric(10, 2) DEFAULT 0 NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"customer_notes" text,
	"internal_notes" text,
	"whatsapp_reference" varchar(160),
	"marketplace_reference" varchar(160),
	"placed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"method" "payment_method" NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"pix_reference" varchar(160),
	"card_brand" varchar(40),
	"card_last4" varchar(4),
	"card_holder_name" varchar(160),
	"verification_note" text,
	"provider" varchar(80),
	"provider_payment_id" varchar(120),
	"amount" numeric(10, 2) NOT NULL,
	"raw_payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"confirmed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"sku" varchar(60) NOT NULL,
	"slug" varchar(160) NOT NULL,
	"name" varchar(180) NOT NULL,
	"category" varchar(80) NOT NULL,
	"theme" varchar(120) NOT NULL,
	"collection" varchar(120) NOT NULL,
	"description" text NOT NULL,
	"merchandising" text,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"colors" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"materials" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"finish_notes" text,
	"grams" integer NOT NULL,
	"hours" numeric(10, 2) NOT NULL,
	"complexity" numeric(10, 2) NOT NULL,
	"production_window" varchar(80) NOT NULL,
	"price_pix" numeric(10, 2) NOT NULL,
	"price_card" numeric(10, 2) NOT NULL,
	"marketplace_suggested" numeric(10, 2),
	"published" boolean DEFAULT false NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"image_path" varchar(255),
	"image_status" "image_status" DEFAULT 'pending' NOT NULL,
	"image_alt" varchar(200),
	"sort_order" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "source_channels" (
	"id" varchar(40) PRIMARY KEY NOT NULL,
	"label" varchar(80) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_notes" ADD CONSTRAINT "admin_notes_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog_image_mappings" ADD CONSTRAINT "catalog_image_mappings_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_events" ADD CONSTRAINT "order_events_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_events" ADD CONSTRAINT "order_events_admin_session_id_admin_sessions_id_fk" FOREIGN KEY ("admin_session_id") REFERENCES "public"."admin_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_address_id_addresses_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_source_channel_id_source_channels_id_fk" FOREIGN KEY ("source_channel_id") REFERENCES "public"."source_channels"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "addresses_customer_idx" ON "addresses" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "admin_notes_order_idx" ON "admin_notes" USING btree ("order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "admin_sessions_hash_idx" ON "admin_sessions" USING btree ("session_token_hash");--> statement-breakpoint
CREATE INDEX "admin_sessions_email_idx" ON "admin_sessions" USING btree ("email");--> statement-breakpoint
CREATE INDEX "catalog_image_mappings_product_idx" ON "catalog_image_mappings" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "customers_whatsapp_idx" ON "customers" USING btree ("whatsapp");--> statement-breakpoint
CREATE INDEX "customers_email_idx" ON "customers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "order_events_order_idx" ON "order_events" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_events_event_type_idx" ON "order_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "order_items_order_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_order_number_idx" ON "orders" USING btree ("order_number");--> statement-breakpoint
CREATE INDEX "orders_customer_idx" ON "orders" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "orders_channel_idx" ON "orders" USING btree ("source_channel_id");--> statement-breakpoint
CREATE INDEX "orders_operational_status_idx" ON "orders" USING btree ("operational_status");--> statement-breakpoint
CREATE INDEX "orders_payment_status_idx" ON "orders" USING btree ("payment_status");--> statement-breakpoint
CREATE INDEX "payment_records_order_idx" ON "payment_records" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "payment_records_provider_idx" ON "payment_records" USING btree ("provider_payment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "products_sku_idx" ON "products" USING btree ("sku");--> statement-breakpoint
CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "products_published_idx" ON "products" USING btree ("published","sort_order");--> statement-breakpoint
CREATE INDEX "products_category_idx" ON "products" USING btree ("category");