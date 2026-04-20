-- CreateEnum
CREATE TYPE "PasswordResetRequestStatus" AS ENUM ('REQUESTED', 'CONSUMED', 'EXPIRED', 'REVOKED');

-- CreateTable
CREATE TABLE "PasswordResetRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "tokenHash" TEXT,
    "status" "PasswordResetRequestStatus" NOT NULL DEFAULT 'REQUESTED',
    "requestedByIp" TEXT,
    "requestedByUserAgent" TEXT,
    "adminEmail" TEXT,
    "adminNotifiedAt" TIMESTAMP(3),
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "consumedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "PasswordResetRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminActionLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "actorEmail" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "summary" TEXT NOT NULL,
    "metadata" JSONB,
    "requestId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminActionLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetRequest_tokenHash_key" ON "PasswordResetRequest"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordResetRequest_email_requestedAt_idx" ON "PasswordResetRequest"("email", "requestedAt");

-- CreateIndex
CREATE INDEX "PasswordResetRequest_userId_requestedAt_idx" ON "PasswordResetRequest"("userId", "requestedAt");

-- CreateIndex
CREATE INDEX "PasswordResetRequest_status_requestedAt_idx" ON "PasswordResetRequest"("status", "requestedAt");

-- CreateIndex
CREATE INDEX "AdminActionLog_actorId_createdAt_idx" ON "AdminActionLog"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "AdminActionLog_entityType_entityId_idx" ON "AdminActionLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AdminActionLog_action_createdAt_idx" ON "AdminActionLog"("action", "createdAt");

-- AddForeignKey
ALTER TABLE "PasswordResetRequest" ADD CONSTRAINT "PasswordResetRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminActionLog" ADD CONSTRAINT "AdminActionLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
