-- AlterTable
ALTER TABLE "studios" ADD COLUMN     "stripeChargesEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stripeConnectStatus" TEXT,
ADD COLUMN     "stripeConnectedAccountId" TEXT,
ADD COLUMN     "stripeDetailsSubmitted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stripeOnboardingComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stripePayoutsEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stripeRequirementsCurrentlyDue" JSONB,
ADD COLUMN     "stripeRequirementsEventuallyDue" JSONB;

-- CreateIndex
CREATE INDEX "studios_stripeConnectStatus_idx" ON "studios"("stripeConnectStatus");
