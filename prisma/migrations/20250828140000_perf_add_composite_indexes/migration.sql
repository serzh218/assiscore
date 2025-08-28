-- Drop old index for chat messages and recreate with DESC ordering
DROP INDEX IF EXISTS "ChatMessage_projectId_createdAt_idx";
CREATE INDEX "ChatMessage_projectId_createdAt_idx" ON "ChatMessage"("projectId", "createdAt" DESC);

-- Project timestamp and indexes
ALTER TABLE "Project" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
CREATE INDEX "Project_visibility_idx" ON "Project"("visibility");
CREATE INDEX "Project_ownerId_updatedAt_idx" ON "Project"("ownerId", "updatedAt" DESC);
CREATE INDEX "Project_visibility_updatedAt_idx" ON "Project"("visibility", "updatedAt" DESC);

-- Subscription indexes and constraints
DROP INDEX IF EXISTS "Subscription_userId_idx";
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_key" UNIQUE("userId");
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");
CREATE INDEX "Subscription_endDate_idx" ON "Subscription"("endDate");

-- Entitlement expiry index
CREATE INDEX "Entitlement_expiresAt_idx" ON "Entitlement"("expiresAt");
