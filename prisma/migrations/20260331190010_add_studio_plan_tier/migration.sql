-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('STARTER', 'PROFESSIONAL', 'ENTERPRISE');

-- AlterTable
ALTER TABLE "studios" ADD COLUMN     "planTier" "PlanTier" NOT NULL DEFAULT 'STARTER';
