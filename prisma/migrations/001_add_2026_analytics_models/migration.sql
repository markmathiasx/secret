-- AddEnum
CREATE TYPE "CatalogEventType" AS ENUM ('VIEW', 'SEARCH', 'FAVORITE', 'PURCHASE', 'CART_ADD');

-- CreateTable AnalyticsEvent
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "eventType" TEXT NOT NULL,
    "productId" TEXT,
    "eventValue" DECIMAL(10,2),
    "eventData" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable UserPersonalization
CREATE TABLE "UserPersonalization" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "preferredCategories" TEXT[],
    "browsingHistory" TEXT[],
    "viewedProducts" INTEGER NOT NULL DEFAULT 0,
    "purchaseHistory" TEXT[],
    "totalSpent" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "averageOrderValue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "lastActiveAt" TIMESTAMP(3),
    "personalizationScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "segmentCode" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPersonalization_pkey" PRIMARY KEY ("id")
);

-- CreateTable ProductRecommendation
CREATE TABLE "ProductRecommendation" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "recommendedProductIds" TEXT[],
    "recommendationType" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "clicked" BOOLEAN NOT NULL DEFAULT false,
    "purchased" BOOLEAN NOT NULL DEFAULT false,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clickedAt" TIMESTAMP(3),
    "purchasedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable SEOMetadata
CREATE TABLE "SEOMetadata" (
    "id" TEXT NOT NULL,
    "productId" TEXT,
    "pageType" TEXT NOT NULL,
    "pageUrl" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "keywords" TEXT[],
    "ogImage" TEXT,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "structuredData" JSONB,
    "canonicalUrl" TEXT,
    "robotsDirective" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "avgPosition" DOUBLE PRECISION,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SEOMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable AnalyticsReport
CREATE TABLE "AnalyticsReport" (
    "id" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "totalVisitors" INTEGER NOT NULL DEFAULT 0,
    "uniqueVisitors" INTEGER NOT NULL DEFAULT 0,
    "totalEvents" INTEGER NOT NULL DEFAULT 0,
    "conversionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgSessionValue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "topProducts" TEXT[],
    "topCategories" TEXT[],
    "reportData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AnalyticsEvent_userId_createdAt_idx" ON "AnalyticsEvent"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_eventType_createdAt_idx" ON "AnalyticsEvent"("eventType", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_productId_createdAt_idx" ON "AnalyticsEvent"("productId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserPersonalization_userId_key" ON "UserPersonalization"("userId");

-- CreateIndex
CREATE INDEX "ProductRecommendation_userId_createdAt_idx" ON "ProductRecommendation"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ProductRecommendation_sessionId_createdAt_idx" ON "ProductRecommendation"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "ProductRecommendation_score_idx" ON "ProductRecommendation"("score");

-- CreateIndex
CREATE UNIQUE INDEX "SEOMetadata_productId_key" ON "SEOMetadata"("productId");

-- CreateIndex
CREATE INDEX "SEOMetadata_pageType_idx" ON "SEOMetadata"("pageType");

-- CreateIndex
CREATE INDEX "SEOMetadata_productId_idx" ON "SEOMetadata"("productId");

-- CreateIndex
CREATE INDEX "AnalyticsReport_reportType_startDate_idx" ON "AnalyticsReport"("reportType", "startDate");

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPersonalization" ADD CONSTRAINT "UserPersonalization_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductRecommendation" ADD CONSTRAINT "ProductRecommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SEOMetadata" ADD CONSTRAINT "SEOMetadata_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
