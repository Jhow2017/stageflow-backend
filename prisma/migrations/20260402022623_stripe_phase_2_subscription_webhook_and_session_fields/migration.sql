-- AlterTable
ALTER TABLE "subscription_checkouts" ADD COLUMN     "stripeCheckoutSessionId" TEXT,
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripeSubscriptionId" TEXT;

-- CreateTable
CREATE TABLE "stripe_webhook_events" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stripe_webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stripe_webhook_events_eventId_key" ON "stripe_webhook_events"("eventId");

-- CreateIndex
CREATE INDEX "stripe_webhook_events_provider_idx" ON "stripe_webhook_events"("provider");

-- CreateIndex
CREATE INDEX "subscription_checkouts_stripeCheckoutSessionId_idx" ON "subscription_checkouts"("stripeCheckoutSessionId");

-- CreateIndex
CREATE INDEX "subscription_checkouts_stripeSubscriptionId_idx" ON "subscription_checkouts"("stripeSubscriptionId");
