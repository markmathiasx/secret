-- AddColumn status, tags, notes, unread to ChatThread for omnichannel inbox
ALTER TABLE "ChatThread" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'open';
ALTER TABLE "ChatThread" ADD COLUMN IF NOT EXISTS "tags" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "ChatThread" ADD COLUMN IF NOT EXISTS "notes" TEXT;
ALTER TABLE "ChatThread" ADD COLUMN IF NOT EXISTS "unread" BOOLEAN NOT NULL DEFAULT true;

-- Backfill: threads that already have a seller reply are not unread
UPDATE "ChatThread" SET "unread" = false WHERE "sellerId" IS NOT NULL;

-- Backfill: threads with WhatsApp "wantsHuman" subject pattern → needs_human
UPDATE "ChatThread"
  SET "status" = 'needs_human'
  WHERE id IN (
    SELECT DISTINCT "threadId" FROM "ChatMessage"
    WHERE body ILIKE '%atendimento humano%' OR body ILIKE '%falar com algu%'
  );

-- Indexes
CREATE INDEX IF NOT EXISTS "ChatThread_status_lastMessageAt_idx" ON "ChatThread"("status", "lastMessageAt");
CREATE INDEX IF NOT EXISTS "ChatThread_unread_channel_idx" ON "ChatThread"("unread", "channel");
