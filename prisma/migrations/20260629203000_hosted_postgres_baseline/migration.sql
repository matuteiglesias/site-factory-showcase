-- CreateTable
CREATE TABLE "OrderRecord" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "templateSlug" TEXT NOT NULL,
    "customerJson" TEXT NOT NULL,
    "briefJson" TEXT NOT NULL,
    "amountARS" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "OrderRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentAttemptRecord" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "orderPublicId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerPreferenceId" TEXT,
    "providerPaymentId" TEXT,
    "providerStatus" TEXT,
    "amountARS" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "rawResponseJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PaymentAttemptRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEventRecord" (
    "id" TEXT NOT NULL,
    "orderPublicId" TEXT,
    "provider" TEXT NOT NULL,
    "providerEventId" TEXT,
    "topic" TEXT,
    "action" TEXT,
    "dataId" TEXT,
    "xRequestId" TEXT,
    "xSignature" TEXT,
    "rawBodyJson" TEXT NOT NULL,
    "processingStatus" TEXT NOT NULL,
    "processingError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    CONSTRAINT "WebhookEventRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderRecord_publicId_key" ON "OrderRecord"("publicId");

-- CreateIndex
CREATE INDEX "OrderRecord_status_idx" ON "OrderRecord"("status");

-- CreateIndex
CREATE INDEX "OrderRecord_templateSlug_idx" ON "OrderRecord"("templateSlug");

-- CreateIndex
CREATE INDEX "OrderRecord_createdAt_idx" ON "OrderRecord"("createdAt");

-- CreateIndex
CREATE INDEX "PaymentAttemptRecord_orderPublicId_idx" ON "PaymentAttemptRecord"("orderPublicId");

-- CreateIndex
CREATE INDEX "PaymentAttemptRecord_provider_idx" ON "PaymentAttemptRecord"("provider");

-- CreateIndex
CREATE INDEX "PaymentAttemptRecord_providerPaymentId_idx" ON "PaymentAttemptRecord"("providerPaymentId");

-- CreateIndex
CREATE INDEX "WebhookEventRecord_orderPublicId_idx" ON "WebhookEventRecord"("orderPublicId");

-- CreateIndex
CREATE INDEX "WebhookEventRecord_provider_idx" ON "WebhookEventRecord"("provider");

-- CreateIndex
CREATE INDEX "WebhookEventRecord_providerEventId_idx" ON "WebhookEventRecord"("providerEventId");

-- CreateIndex
CREATE INDEX "WebhookEventRecord_processingStatus_idx" ON "WebhookEventRecord"("processingStatus");

-- AddForeignKey
ALTER TABLE "PaymentAttemptRecord" ADD CONSTRAINT "PaymentAttemptRecord_orderPublicId_fkey" FOREIGN KEY ("orderPublicId") REFERENCES "OrderRecord"("publicId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookEventRecord" ADD CONSTRAINT "WebhookEventRecord_orderPublicId_fkey" FOREIGN KEY ("orderPublicId") REFERENCES "OrderRecord"("publicId") ON DELETE SET NULL ON UPDATE CASCADE;
