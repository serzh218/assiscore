-- Add status and notes to Patch
ALTER TABLE "Patch" ADD COLUMN "status" "ProjectStatus" NOT NULL DEFAULT 'draft';
ALTER TABLE "Patch" ADD COLUMN "notes" TEXT;
