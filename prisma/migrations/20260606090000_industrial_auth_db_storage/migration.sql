-- Industrial auth/database/storage foundation.
-- Additive and idempotent for existing MDH 3D production databases.

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "disabledAt" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "UserProfile" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "document" TEXT,
  "zipCode" TEXT,
  "line1" TEXT,
  "line2" TEXT,
  "neighborhood" TEXT,
  "city" TEXT,
  "state" TEXT,
  "country" TEXT NOT NULL DEFAULT 'BR',
  "preferences" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "UserProfile_userId_key" ON "UserProfile"("userId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'UserProfile_userId_fkey'
  ) THEN
    ALTER TABLE "UserProfile"
      ADD CONSTRAINT "UserProfile_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "ProductOverride" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "title" TEXT,
  "description" TEXT,
  "pricePix" NUMERIC(10,2),
  "priceCard" NUMERIC(10,2),
  "active" BOOLEAN NOT NULL DEFAULT true,
  "payload" JSONB,
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProductOverride_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ProductOverride_productId_key" ON "ProductOverride"("productId");
CREATE INDEX IF NOT EXISTS "ProductOverride_updatedBy_updatedAt_idx" ON "ProductOverride"("updatedBy", "updatedAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ProductOverride_productId_fkey'
  ) THEN
    ALTER TABLE "ProductOverride"
      ADD CONSTRAINT "ProductOverride_productId_fkey"
      FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ProductOverride_updatedBy_fkey'
  ) THEN
    ALTER TABLE "ProductOverride"
      ADD CONSTRAINT "ProductOverride_updatedBy_fkey"
      FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

ALTER TABLE "Cart" ADD COLUMN IF NOT EXISTS "sessionId" TEXT;
CREATE INDEX IF NOT EXISTS "Cart_sessionId_status_idx" ON "Cart"("sessionId", "status");

ALTER TABLE "CartItem"
  ADD COLUMN IF NOT EXISTS "unitPricePix" NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS "unitPriceCard" NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS "customizations" JSONB;

ALTER TABLE "Order"
  ADD COLUMN IF NOT EXISTS "sessionId" TEXT,
  ADD COLUMN IF NOT EXISTS "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS "totalPix" NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS "totalCard" NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS "shippingAddressJson" JSONB;

CREATE INDEX IF NOT EXISTS "Order_sessionId_createdAt_idx" ON "Order"("sessionId", "createdAt");

ALTER TABLE "OrderItem"
  ADD COLUMN IF NOT EXISTS "titleSnapshot" TEXT,
  ADD COLUMN IF NOT EXISTS "pricePixSnapshot" NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS "priceCardSnapshot" NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS "customizations" JSONB;

ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "raw" JSONB;

CREATE TABLE IF NOT EXISTS "FileAsset" (
  "id" TEXT NOT NULL,
  "ownerUserId" TEXT,
  "bucket" TEXT NOT NULL,
  "path" TEXT NOT NULL,
  "publicUrl" TEXT,
  "mimeType" TEXT NOT NULL,
  "sizeBytes" INTEGER NOT NULL,
  "checksum" TEXT NOT NULL,
  "purpose" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FileAsset_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "FileAsset_path_key" ON "FileAsset"("path");
CREATE INDEX IF NOT EXISTS "FileAsset_ownerUserId_createdAt_idx" ON "FileAsset"("ownerUserId", "createdAt");
CREATE INDEX IF NOT EXISTS "FileAsset_purpose_createdAt_idx" ON "FileAsset"("purpose", "createdAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'FileAsset_ownerUserId_fkey'
  ) THEN
    ALTER TABLE "FileAsset"
      ADD CONSTRAINT "FileAsset_ownerUserId_fkey"
      FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

ALTER TABLE "QuoteRequest" ADD COLUMN IF NOT EXISTS "referenceFileId" TEXT;
CREATE INDEX IF NOT EXISTS "QuoteRequest_referenceFileId_idx" ON "QuoteRequest"("referenceFileId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'QuoteRequest_referenceFileId_fkey'
  ) THEN
    ALTER TABLE "QuoteRequest"
      ADD CONSTRAINT "QuoteRequest_referenceFileId_fkey"
      FOREIGN KEY ("referenceFileId") REFERENCES "FileAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "SupportConversation" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "sessionId" TEXT NOT NULL,
  "orderId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'open',
  "sourcePage" TEXT,
  "summary" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SupportConversation_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "SupportConversation_userId_createdAt_idx" ON "SupportConversation"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "SupportConversation_sessionId_createdAt_idx" ON "SupportConversation"("sessionId", "createdAt");
CREATE INDEX IF NOT EXISTS "SupportConversation_status_updatedAt_idx" ON "SupportConversation"("status", "updatedAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'SupportConversation_userId_fkey'
  ) THEN
    ALTER TABLE "SupportConversation"
      ADD CONSTRAINT "SupportConversation_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'SupportConversation_orderId_fkey'
  ) THEN
    ALTER TABLE "SupportConversation"
      ADD CONSTRAINT "SupportConversation_orderId_fkey"
      FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "SupportMessage" (
  "id" TEXT NOT NULL,
  "conversationId" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SupportMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "SupportMessage_conversationId_createdAt_idx" ON "SupportMessage"("conversationId", "createdAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'SupportMessage_conversationId_fkey'
  ) THEN
    ALTER TABLE "SupportMessage"
      ADD CONSTRAINT "SupportMessage_conversationId_fkey"
      FOREIGN KEY ("conversationId") REFERENCES "SupportConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id" TEXT NOT NULL,
  "actorUserId" TEXT,
  "action" TEXT NOT NULL,
  "targetType" TEXT,
  "targetId" TEXT,
  "ipHash" TEXT,
  "userAgentHash" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AuditLog_actorUserId_createdAt_idx" ON "AuditLog"("actorUserId", "createdAt");
CREATE INDEX IF NOT EXISTS "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");
CREATE INDEX IF NOT EXISTS "AuditLog_targetType_targetId_idx" ON "AuditLog"("targetType", "targetId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'AuditLog_actorUserId_fkey'
  ) THEN
    ALTER TABLE "AuditLog"
      ADD CONSTRAINT "AuditLog_actorUserId_fkey"
      FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
