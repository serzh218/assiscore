-- Remove User plan-related columns
ALTER TABLE "User" DROP COLUMN "plan";
ALTER TABLE "User" DROP COLUMN "tokens";

-- Rename old Plan enum to free up the name
DO $$ BEGIN
  ALTER TYPE "Plan" RENAME TO "Plan_old";
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- Create the new Plan enum with updated values
DO $$ BEGIN
  CREATE TYPE "Plan" AS ENUM ('FREE','PRO','TEAM');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Reassign Organization.plan to use the new enum
ALTER TABLE "Organization"
  ALTER COLUMN "plan" DROP DEFAULT,
  ALTER COLUMN "plan" TYPE "Plan" USING ("plan"::text)::"Plan",
  ALTER COLUMN "plan" SET DEFAULT 'FREE';

-- Drop the old enum type
DO $$ BEGIN
  DROP TYPE IF EXISTS "Plan_old";
EXCEPTION WHEN undefined_object THEN NULL;
END $$;
