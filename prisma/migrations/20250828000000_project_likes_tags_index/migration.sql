-- AddLikesTagsAndVisibilityIndex
ALTER TABLE "Project" ADD COLUMN "likes" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Project" ADD COLUMN "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
CREATE INDEX "Project_visibility_createdAt_idx" ON "Project"("visibility", "createdAt");
