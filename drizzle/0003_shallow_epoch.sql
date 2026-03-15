CREATE TYPE "public"."audit_actor_type" AS ENUM('admin', 'customer', 'system', 'anonymous');--> statement-breakpoint
ALTER TYPE "public"."order_event_type" ADD VALUE 'risk_flagged';--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_type" "audit_actor_type" NOT NULL,
	"actor_id" varchar(160),
	"action" varchar(120) NOT NULL,
	"resource_type" varchar(80) NOT NULL,
	"resource_id" varchar(191),
	"ip_address_hash" varchar(64),
	"user_agent" text,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP INDEX "customers_whatsapp_idx";--> statement-breakpoint
ALTER TABLE "addresses" ALTER COLUMN "postal_code" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "addresses" ALTER COLUMN "street" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "addresses" ALTER COLUMN "number" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "addresses" ALTER COLUMN "complement" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "addresses" ALTER COLUMN "reference" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "addresses" ALTER COLUMN "neighborhood" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "addresses" ALTER COLUMN "city" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "addresses" ALTER COLUMN "state" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "customers" ALTER COLUMN "whatsapp" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "whatsapp_hash" varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "whatsapp_last4" varchar(4) NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "review_required" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "risk_score" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "risk_signals" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "ip_address_hash" varchar(64);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "review_note" text;--> statement-breakpoint
CREATE INDEX "audit_logs_action_idx" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_logs_resource_idx" ON "audit_logs" USING btree ("resource_type","resource_id");--> statement-breakpoint
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "customers_whatsapp_hash_idx" ON "customers" USING btree ("whatsapp_hash");--> statement-breakpoint
CREATE INDEX "customers_whatsapp_last4_idx" ON "customers" USING btree ("whatsapp_last4");--> statement-breakpoint
CREATE INDEX "orders_review_required_idx" ON "orders" USING btree ("review_required","risk_score");