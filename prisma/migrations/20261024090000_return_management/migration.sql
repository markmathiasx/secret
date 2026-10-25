DO $$
BEGIN
  CREATE TYPE "ReturnRequestType" AS ENUM ('RETURN', 'EXCHANGE', 'WARRANTY');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "ReturnRequestStatus" AS ENUM ('REQUESTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'AWAITING_SHIPMENT', 'IN_TRANSIT', 'RECEIVED', 'REFUND_PENDING', 'REFUNDED', 'EXCHANGED', 'CANCELED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "ReturnEventType" AS ENUM ('REQUESTED', 'STATUS_CHANGED', 'CUSTOMER_MESSAGE', 'STAFF_MESSAGE', 'SHIPPING_LABEL_CREATED', 'ITEM_RECEIVED', 'REFUND_REQUESTED', 'REFUND_COMPLETED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "ReturnRequest" (
  "id" TEXT NOT NULL,
  "protocol" TEXT NOT NULL,
  "requestKey" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "buyerId" TEXT,
  "type" "ReturnRequestType" NOT NULL DEFAULT 'RETURN',
  "status" "ReturnRequestStatus" NOT NULL DEFAULT 'REQUESTED',
  "customerName" TEXT NOT NULL,
  "customerEmail" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "description" TEXT,
  "resolution" TEXT,
  "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "approvedAt" TIMESTAMP(3),
  "receivedAt" TIMESTAMP(3),
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ReturnRequest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ReturnRequest_protocol_key" ON "ReturnRequest"("protocol");
CREATE UNIQUE INDEX IF NOT EXISTS "ReturnRequest_requestKey_key" ON "ReturnRequest"("requestKey");
CREATE INDEX IF NOT EXISTS "ReturnRequest_orderId_createdAt_idx" ON "ReturnRequest"("orderId", "createdAt");
CREATE INDEX IF NOT EXISTS "ReturnRequest_buyerId_createdAt_idx" ON "ReturnRequest"("buyerId", "createdAt");
CREATE INDEX IF NOT EXISTS "ReturnRequest_status_createdAt_idx" ON "ReturnRequest"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "ReturnRequest_customerEmail_createdAt_idx" ON "ReturnRequest"("customerEmail", "createdAt");

CREATE TABLE IF NOT EXISTS "ReturnRequestEvent" (
  "id" TEXT NOT NULL,
  "returnRequestId" TEXT NOT NULL,
  "type" "ReturnEventType" NOT NULL,
  "actorUserId" TEXT,
  "message" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ReturnRequestEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ReturnRequestEvent_returnRequestId_createdAt_idx" ON "ReturnRequestEvent"("returnRequestId", "createdAt");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ReturnRequest_orderId_fkey') THEN
    ALTER TABLE "ReturnRequest" ADD CONSTRAINT "ReturnRequest_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ReturnRequest_buyerId_fkey') THEN
    ALTER TABLE "ReturnRequest" ADD CONSTRAINT "ReturnRequest_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ReturnRequestEvent_returnRequestId_fkey') THEN
    ALTER TABLE "ReturnRequestEvent" ADD CONSTRAINT "ReturnRequestEvent_returnRequestId_fkey" FOREIGN KEY ("returnRequestId") REFERENCES "ReturnRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
