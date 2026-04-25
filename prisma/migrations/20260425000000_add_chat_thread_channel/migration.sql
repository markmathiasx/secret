-- Add channel field to ChatThread for omnichannel inbox support
-- Values: site | whatsapp | facebook_page | instagram_dm | instagram_comment
ALTER TABLE "ChatThread" ADD COLUMN IF NOT EXISTS "channel" TEXT NOT NULL DEFAULT 'site';

-- Backfill existing WhatsApp threads (email pattern: wa-*@mdh.local)
UPDATE "ChatThread" ct
SET "channel" = 'whatsapp'
FROM "User" u
WHERE ct."buyerId" = u.id
  AND u.email LIKE 'wa-%@mdh.local';

-- Backfill Facebook Page threads
UPDATE "ChatThread" ct
SET "channel" = 'facebook_page'
FROM "User" u
WHERE ct."buyerId" = u.id
  AND u.email LIKE 'fb-%@mdh.local';

-- Backfill Instagram DM threads
UPDATE "ChatThread" ct
SET "channel" = 'instagram_dm'
FROM "User" u
WHERE ct."buyerId" = u.id
  AND u.email LIKE 'ig-%@mdh.local';

-- Backfill Instagram comment threads
UPDATE "ChatThread" ct
SET "channel" = 'instagram_comment'
FROM "User" u
WHERE ct."buyerId" = u.id
  AND u.email LIKE 'igc-%@mdh.local';

CREATE INDEX IF NOT EXISTS "ChatThread_channel_idx" ON "ChatThread"("channel");
