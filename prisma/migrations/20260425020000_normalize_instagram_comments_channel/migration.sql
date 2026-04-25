-- Normalize legacy singular Instagram comment channel to the public omnichannel name.
UPDATE "ChatThread"
SET "channel" = 'instagram_comments'
WHERE "channel" = 'instagram_comment';
