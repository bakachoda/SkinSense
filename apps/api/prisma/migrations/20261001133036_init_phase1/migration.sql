-- CreateEnum
CREATE TYPE "SkinType" AS ENUM ('OILY', 'DRY', 'COMBINATION', 'NORMAL', 'SENSITIVE');

-- CreateEnum
CREATE TYPE "ScanStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('CLEANSER', 'TONER', 'SERUM', 'MOISTURIZER', 'SPF', 'TREATMENT', 'MASK', 'EYE_CREAM');

-- CreateEnum
CREATE TYPE "SkinConcern" AS ENUM ('ACNE', 'REDNESS', 'PIGMENTATION', 'DRYNESS', 'FINE_LINES', 'OILINESS', 'SENSITIVITY', 'TEXTURE');

-- CreateEnum
CREATE TYPE "PriceTier" AS ENUM ('BUDGET', 'MID', 'PREMIUM');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "supabaseId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "skinType" "SkinType",
    "fitzpatrick" INTEGER,
    "birthYear" INTEGER,
    "ageRange" TEXT,
    "concerns" TEXT[],
    "allergies" TEXT[],
    "isPregnant" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "ScanStatus" NOT NULL DEFAULT 'PENDING',
    "imageKeys" TEXT[],
    "questionnaire" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Scan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScanResult" (
    "id" TEXT NOT NULL,
    "scanId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "skinHealthScore" INTEGER NOT NULL,
    "zoneScores" JSONB NOT NULL,
    "findings" JSONB NOT NULL,
    "metadata" JSONB NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "processingTimeMs" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScanResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "category" "ProductCategory" NOT NULL,
    "skinTypes" "SkinType"[],
    "concerns" "SkinConcern"[],
    "ingredients" TEXT[],
    "activeIngredients" JSONB NOT NULL,
    "priceTier" "PriceTier" NOT NULL,
    "imageUrl" TEXT,
    "purchaseUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Routine" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scanResultId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "amSteps" JSONB NOT NULL,
    "pmSteps" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Routine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdherenceLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "routineId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "amCompleted" BOOLEAN NOT NULL DEFAULT false,
    "pmCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdherenceLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_supabaseId_key" ON "User"("supabaseId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_supabaseId_idx" ON "User"("supabaseId");

-- CreateIndex
CREATE INDEX "Scan_userId_idx" ON "Scan"("userId");

-- CreateIndex
CREATE INDEX "Scan_status_idx" ON "Scan"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ScanResult_scanId_key" ON "ScanResult"("scanId");

-- CreateIndex
CREATE INDEX "Product_category_idx" ON "Product"("category");

-- CreateIndex
CREATE INDEX "Product_brand_idx" ON "Product"("brand");

-- CreateIndex
CREATE INDEX "Routine_userId_idx" ON "Routine"("userId");

-- CreateIndex
CREATE INDEX "AdherenceLog_userId_idx" ON "AdherenceLog"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AdherenceLog_userId_routineId_date_key" ON "AdherenceLog"("userId", "routineId", "date");

-- AddForeignKey
ALTER TABLE "Scan" ADD CONSTRAINT "Scan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanResult" ADD CONSTRAINT "ScanResult_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "Scan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Routine" ADD CONSTRAINT "Routine_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
