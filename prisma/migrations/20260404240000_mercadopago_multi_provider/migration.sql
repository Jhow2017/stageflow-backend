-- CreateEnum
CREATE TYPE "MercadoPagoConnectionType" AS ENUM ('OAUTH', 'MANUAL');

-- CreateEnum
CREATE TYPE "PayoutProvider" AS ENUM ('MERCADOPAGO', 'STRIPE');

-- CreateEnum
CREATE TYPE "PlatformPaymentProvider" AS ENUM ('MERCADOPAGO', 'STRIPE');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "mercadoPagoConnectionType" "MercadoPagoConnectionType",
ADD COLUMN     "mercadoPagoAccessToken" TEXT,
ADD COLUMN     "mercadoPagoPublicKey" TEXT,
ADD COLUMN     "mercadoPagoUserId" TEXT,
ADD COLUMN     "mercadoPagoRefreshToken" TEXT,
ADD COLUMN     "mercadoPagoTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "mercadoPagoConnectedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "users_mercadoPagoUserId_idx" ON "users"("mercadoPagoUserId");

-- AlterTable
ALTER TABLE "studios" ADD COLUMN     "payoutProvider" "PayoutProvider" NOT NULL DEFAULT 'MERCADOPAGO';

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "mercadoPagoPaymentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "bookings_mercadoPagoPaymentId_key" ON "bookings"("mercadoPagoPaymentId");

-- AlterTable
ALTER TABLE "subscription_checkouts" ADD COLUMN     "platformPaymentProvider" "PlatformPaymentProvider" NOT NULL DEFAULT 'MERCADOPAGO',
ADD COLUMN     "mercadoPagoPreapprovalId" TEXT,
ADD COLUMN     "mercadoPagoPaymentId" TEXT;

-- CreateIndex
CREATE INDEX "subscription_checkouts_mercadoPagoPreapprovalId_idx" ON "subscription_checkouts"("mercadoPagoPreapprovalId");

-- CreateIndex
CREATE INDEX "subscription_checkouts_mercadoPagoPaymentId_idx" ON "subscription_checkouts"("mercadoPagoPaymentId");

-- CreateTable
CREATE TABLE "mercadopago_webhook_events" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "payload" JSONB,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mercadopago_webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mercadopago_webhook_events_topic_idx" ON "mercadopago_webhook_events"("topic");

-- CreateIndex
CREATE UNIQUE INDEX "mercadopago_webhook_events_resourceId_topic_key" ON "mercadopago_webhook_events"("resourceId", "topic");
