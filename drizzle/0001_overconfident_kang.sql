CREATE TYPE "public"."analytics_event_name" AS ENUM('view_home', 'view_category', 'view_product', 'search', 'filter_change', 'add_to_cart', 'begin_checkout', 'order_payment_selected', 'create_order', 'order_created', 'click_whatsapp', 'admin_order_status_updated');--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_name" "analytics_event_name" NOT NULL,
	"scope" varchar(40) DEFAULT 'store' NOT NULL,
	"path" varchar(255),
	"session_id" varchar(120),
	"ip_address" varchar(80),
	"user_agent" text,
	"order_id" uuid,
	"product_id" varchar(64),
	"customer_id" uuid,
	"admin_session_id" uuid,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_admin_session_id_admin_sessions_id_fk" FOREIGN KEY ("admin_session_id") REFERENCES "public"."admin_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "analytics_events_event_name_idx" ON "analytics_events" USING btree ("event_name");--> statement-breakpoint
CREATE INDEX "analytics_events_order_idx" ON "analytics_events" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "analytics_events_product_idx" ON "analytics_events" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "analytics_events_created_at_idx" ON "analytics_events" USING btree ("created_at");