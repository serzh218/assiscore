-- Alter enum for ProjectStatus
ALTER TYPE "ProjectStatus" ADD VALUE IF NOT EXISTS 'deploying';

-- Add new columns to Project
ALTER TABLE "Project"
  ADD COLUMN "deployProvider" TEXT,
  ADD COLUMN "domain" TEXT,
  ADD COLUMN "lastDeployedAt" TIMESTAMP(3);
