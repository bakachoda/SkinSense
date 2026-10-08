-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'PRO_MONTHLY', 'PRO_ANNUAL', 'FOUNDER_LIFETIME');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELED', 'EXPIRED');

-- AlterTable
ALTER TABLE "Scan" ADD COLUMN     "calibrationKey" TEXT,
ADD COLUMN     "captureMode" TEXT,
ADD COLUMN     "depthMapUrl" TEXT,
ADD COLUMN     "deviceCapabilities" JSONB,
ADD COLUMN     "environmentScore" TEXT,
ADD COLUMN     "frameCount" INTEGER,
ADD COLUMN     "gyroData" JSONB,
ADD COLUMN     "multispectralUrls" JSONB,
ADD COLUMN     "physiologicalState" JSONB,
ADD COLUMN     "pointCloudUrl" TEXT,
ADD COLUMN     "rawFileUrl" TEXT,
ADD COLUMN     "videoUrl" TEXT;

-- AlterTable
ALTER TABLE "ScanResult" ADD COLUMN     "bacteriaLevel" DOUBLE PRECISION,
ADD COLUMN     "barrierScore" INTEGER,
ADD COLUMN     "clinicalGrading" JSONB,
ADD COLUMN     "differential" JSONB,
ADD COLUMN     "elasticityRecoveryTimeMs" DOUBLE PRECISION,
ADD COLUMN     "elasticityScore" TEXT,
ADD COLUMN     "environmentalContext" JSONB,
ADD COLUMN     "fitzpatrick" INTEGER,
ADD COLUMN     "hairCoveragePercent" DOUBLE PRECISION,
ADD COLUMN     "hasMakeup" BOOLEAN,
ADD COLUMN     "inflammationStatus" TEXT,
ADD COLUMN     "lesionHeightMm" DOUBLE PRECISION,
ADD COLUMN     "measuredSkinType" TEXT,
ADD COLUMN     "oilinessMap" JSONB,
ADD COLUMN     "perfusionScore" DOUBLE PRECISION,
ADD COLUMN     "poreDepthMm" DOUBLE PRECISION,
ADD COLUMN     "safetyFlags" JSONB,
ADD COLUMN     "scaleFactorMm" DOUBLE PRECISION,
ADD COLUMN     "skinAge" JSONB,
ADD COLUMN     "topologyClassification" TEXT,
ADD COLUMN     "treatmentPhase" INTEGER,
ADD COLUMN     "zoneCoverage" JSONB;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "activeProfileId" TEXT,
ADD COLUMN     "amReminderEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "dataRegion" TEXT NOT NULL DEFAULT 'US',
ADD COLUMN     "disclaimerAcknowledgedAt" TIMESTAMP(3),
ADD COLUMN     "disclaimerVersion" INTEGER,
ADD COLUMN     "lifeStage" TEXT NOT NULL DEFAULT 'NONE',
ADD COLUMN     "pmReminderEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "scanReminderEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "voiceTranscripts" JSONB;

-- CreateTable
CREATE TABLE "SelfAssessment" (
    "id" TEXT NOT NULL,
    "scanId" TEXT NOT NULL,
    "selections" JSONB NOT NULL,
    "spotMarkers" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SelfAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "screenshotUrl" TEXT,
    "appVersion" TEXT,
    "osVersion" TEXT,
    "deviceModel" TEXT,
    "logs" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProduct" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "category" "ProductCategory" NOT NULL,
    "ingredients" TEXT[],
    "activeIngredients" JSONB NOT NULL,
    "routineSlot" TEXT NOT NULL,
    "stepOrder" INTEGER NOT NULL,
    "scannedVia" TEXT NOT NULL,
    "addedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Medication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "restriction" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Medication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceProfile" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "userId" TEXT,
    "osType" TEXT NOT NULL,
    "osVersion" TEXT NOT NULL,
    "deviceModel" TEXT,
    "capabilities" JSONB NOT NULL,
    "whiteBalanceMatrix" JSONB,
    "colorAccuracyDeltaE" DOUBLE PRECISION,
    "noiseFloorRgb" DOUBLE PRECISION[],
    "dynamicRangeStops" DOUBLE PRECISION,
    "calibrationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "calibrationLightingLux" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeviceProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prediction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "predictionType" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "timeframe" TEXT,
    "recommendation" TEXT,
    "inputFeatures" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "wasAccurate" BOOLEAN,

    CONSTRAINT "Prediction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LifestyleLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "sleepHours" DOUBLE PRECISION NOT NULL,
    "waterGlasses" INTEGER NOT NULL,
    "stressLevel" INTEGER NOT NULL,
    "exerciseMinutes" INTEGER NOT NULL,
    "sunExposureMinutes" INTEGER NOT NULL,
    "dietTags" TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LifestyleLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkinTrend" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "concern" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "slope" DOUBLE PRECISION NOT NULL,
    "currentValue" DOUBLE PRECISION NOT NULL,
    "previousValue" DOUBLE PRECISION NOT NULL,
    "delta" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "window" TEXT NOT NULL,
    "dataPoints" JSONB NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SkinTrend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unlockedAt" TIMESTAMP(3),
    "isNew" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CohortStats" (
    "id" TEXT NOT NULL,
    "fitzpatrick" INTEGER NOT NULL,
    "ageRange" TEXT NOT NULL,
    "concern" TEXT NOT NULL,
    "climateZone" TEXT,
    "metric" TEXT NOT NULL,
    "p25" DOUBLE PRECISION NOT NULL,
    "median" DOUBLE PRECISION NOT NULL,
    "p75" DOUBLE PRECISION NOT NULL,
    "sampleSize" INTEGER NOT NULL,
    "topProducts" JSONB,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CohortStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortalAccess" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PortalAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DermatologistNote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "portalAccessId" TEXT NOT NULL,
    "clinicianName" TEXT,
    "message" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DermatologistNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiagnosticCorrection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scanId" TEXT NOT NULL,
    "systemDifferential" TEXT NOT NULL,
    "professionalDiagnosis" TEXT NOT NULL,
    "prescriptions" TEXT[],
    "consentToTraining" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiagnosticCorrection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutineVersion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "routineId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "amSteps" JSONB NOT NULL,
    "pmSteps" JSONB NOT NULL,
    "changeReason" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoutineVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "avatarUri" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "biometricLockEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthSyncLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "sleepHours" DOUBLE PRECISION,
    "sleepQuality" TEXT,
    "hrvAvgMs" DOUBLE PRECISION,
    "hrvTrend" TEXT,
    "cyclePhase" TEXT,
    "stepsCount" INTEGER,
    "rawPayloadSummary" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HealthSyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentPeriodStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentPeriodEnd" TIMESTAMP(3),
    "trialEndsAt" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "provider" TEXT NOT NULL DEFAULT 'SANDBOX_TEST',
    "providerSubscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScanQuota" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "yearMonth" TEXT NOT NULL,
    "scansUsed" INTEGER NOT NULL DEFAULT 0,
    "maxAllowed" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScanQuota_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SelfAssessment_scanId_key" ON "SelfAssessment"("scanId");

-- CreateIndex
CREATE INDEX "SelfAssessment_scanId_idx" ON "SelfAssessment"("scanId");

-- CreateIndex
CREATE INDEX "Feedback_userId_idx" ON "Feedback"("userId");

-- CreateIndex
CREATE INDEX "Feedback_type_idx" ON "Feedback"("type");

-- CreateIndex
CREATE INDEX "UserProduct_userId_idx" ON "UserProduct"("userId");

-- CreateIndex
CREATE INDEX "UserProduct_category_idx" ON "UserProduct"("category");

-- CreateIndex
CREATE INDEX "Medication_userId_idx" ON "Medication"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceProfile_deviceId_key" ON "DeviceProfile"("deviceId");

-- CreateIndex
CREATE INDEX "DeviceProfile_deviceId_idx" ON "DeviceProfile"("deviceId");

-- CreateIndex
CREATE INDEX "DeviceProfile_userId_idx" ON "DeviceProfile"("userId");

-- CreateIndex
CREATE INDEX "Prediction_userId_idx" ON "Prediction"("userId");

-- CreateIndex
CREATE INDEX "Prediction_predictionType_idx" ON "Prediction"("predictionType");

-- CreateIndex
CREATE INDEX "LifestyleLog_userId_idx" ON "LifestyleLog"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LifestyleLog_userId_date_key" ON "LifestyleLog"("userId", "date");

-- CreateIndex
CREATE INDEX "SkinTrend_userId_idx" ON "SkinTrend"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SkinTrend_userId_zone_concern_window_key" ON "SkinTrend"("userId", "zone", "concern", "window");

-- CreateIndex
CREATE INDEX "Achievement_userId_idx" ON "Achievement"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_userId_achievementId_key" ON "Achievement"("userId", "achievementId");

-- CreateIndex
CREATE INDEX "CohortStats_fitzpatrick_ageRange_idx" ON "CohortStats"("fitzpatrick", "ageRange");

-- CreateIndex
CREATE UNIQUE INDEX "CohortStats_fitzpatrick_ageRange_concern_metric_key" ON "CohortStats"("fitzpatrick", "ageRange", "concern", "metric");

-- CreateIndex
CREATE UNIQUE INDEX "PortalAccess_accessToken_key" ON "PortalAccess"("accessToken");

-- CreateIndex
CREATE INDEX "PortalAccess_accessToken_idx" ON "PortalAccess"("accessToken");

-- CreateIndex
CREATE INDEX "PortalAccess_userId_idx" ON "PortalAccess"("userId");

-- CreateIndex
CREATE INDEX "DermatologistNote_userId_idx" ON "DermatologistNote"("userId");

-- CreateIndex
CREATE INDEX "DermatologistNote_portalAccessId_idx" ON "DermatologistNote"("portalAccessId");

-- CreateIndex
CREATE INDEX "DiagnosticCorrection_userId_idx" ON "DiagnosticCorrection"("userId");

-- CreateIndex
CREATE INDEX "DiagnosticCorrection_scanId_idx" ON "DiagnosticCorrection"("scanId");

-- CreateIndex
CREATE INDEX "RoutineVersion_userId_routineId_idx" ON "RoutineVersion"("userId", "routineId");

-- CreateIndex
CREATE INDEX "AppProfile_userId_idx" ON "AppProfile"("userId");

-- CreateIndex
CREATE INDEX "HealthSyncLog_userId_idx" ON "HealthSyncLog"("userId");

-- CreateIndex
CREATE INDEX "HealthSyncLog_date_idx" ON "HealthSyncLog"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "ScanQuota_userId_idx" ON "ScanQuota"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ScanQuota_userId_yearMonth_key" ON "ScanQuota"("userId", "yearMonth");

-- AddForeignKey
ALTER TABLE "SelfAssessment" ADD CONSTRAINT "SelfAssessment_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "Scan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdherenceLog" ADD CONSTRAINT "AdherenceLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProduct" ADD CONSTRAINT "UserProduct_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medication" ADD CONSTRAINT "Medication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceProfile" ADD CONSTRAINT "DeviceProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prediction" ADD CONSTRAINT "Prediction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LifestyleLog" ADD CONSTRAINT "LifestyleLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkinTrend" ADD CONSTRAINT "SkinTrend_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalAccess" ADD CONSTRAINT "PortalAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DermatologistNote" ADD CONSTRAINT "DermatologistNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DermatologistNote" ADD CONSTRAINT "DermatologistNote_portalAccessId_fkey" FOREIGN KEY ("portalAccessId") REFERENCES "PortalAccess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiagnosticCorrection" ADD CONSTRAINT "DiagnosticCorrection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineVersion" ADD CONSTRAINT "RoutineVersion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppProfile" ADD CONSTRAINT "AppProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthSyncLog" ADD CONSTRAINT "HealthSyncLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanQuota" ADD CONSTRAINT "ScanQuota_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
