import { Test, TestingModule } from "@nestjs/testing";
import { TemporalAnalyticsService } from "./temporal-analytics.service";
import { SkinTwinService } from "./skin-twin.service";
import { LifestyleCorrelationService } from "./lifestyle-correlation.service";
import { AchievementService } from "./achievement.service";
import { PrismaService } from "../prisma/prisma.service";

// ── Mock Prisma ──

const mockScans = [
  {
    id: "scan-1",
    userId: "user-1",
    status: "COMPLETED",
    createdAt: new Date("2026-09-01"),
    result: {
      skinHealthScore: 65,
      barrierScore: 55,
      zoneScores: {
        forehead: { acne: 60, redness: 30, pigmentation: 20, texture: 40, dryness: 50, oiliness: 55 },
        nose: { acne: 40, redness: 25, pigmentation: 15, texture: 50, dryness: 30, oiliness: 70 },
        left_cheek: { acne: 65, redness: 45, pigmentation: 35, texture: 35, dryness: 45, oiliness: 40 },
        right_cheek: { acne: 55, redness: 40, pigmentation: 30, texture: 30, dryness: 40, oiliness: 35 },
        chin: { acne: 50, redness: 28, pigmentation: 20, texture: 40, dryness: 35, oiliness: 45 },
        periorbital: { acne: 0, redness: 20, pigmentation: 50, texture: 40, dryness: 55, oiliness: 10 },
      },
    },
  },
  {
    id: "scan-2",
    userId: "user-1",
    status: "COMPLETED",
    createdAt: new Date("2026-09-15"),
    result: {
      skinHealthScore: 72,
      barrierScore: 62,
      zoneScores: {
        forehead: { acne: 50, redness: 25, pigmentation: 18, texture: 35, dryness: 45, oiliness: 50 },
        nose: { acne: 35, redness: 20, pigmentation: 12, texture: 45, dryness: 25, oiliness: 65 },
        left_cheek: { acne: 55, redness: 38, pigmentation: 30, texture: 30, dryness: 40, oiliness: 35 },
        right_cheek: { acne: 48, redness: 35, pigmentation: 25, texture: 28, dryness: 38, oiliness: 30 },
        chin: { acne: 42, redness: 24, pigmentation: 18, texture: 35, dryness: 30, oiliness: 40 },
        periorbital: { acne: 0, redness: 18, pigmentation: 45, texture: 35, dryness: 50, oiliness: 10 },
      },
    },
  },
  {
    id: "scan-3",
    userId: "user-1",
    status: "COMPLETED",
    createdAt: new Date("2026-10-01"),
    result: {
      skinHealthScore: 78,
      barrierScore: 68,
      zoneScores: {
        forehead: { acne: 40, redness: 20, pigmentation: 15, texture: 30, dryness: 40, oiliness: 45 },
        nose: { acne: 30, redness: 18, pigmentation: 10, texture: 40, dryness: 22, oiliness: 60 },
        left_cheek: { acne: 45, redness: 32, pigmentation: 25, texture: 25, dryness: 35, oiliness: 30 },
        right_cheek: { acne: 40, redness: 30, pigmentation: 22, texture: 24, dryness: 34, oiliness: 28 },
        chin: { acne: 35, redness: 20, pigmentation: 15, texture: 30, dryness: 28, oiliness: 35 },
        periorbital: { acne: 0, redness: 15, pigmentation: 40, texture: 30, dryness: 45, oiliness: 10 },
      },
    },
  },
];

const mockLifestyleLogs = [
  { userId: "user-1", date: new Date("2026-09-28"), sleepHours: 7.5, waterGlasses: 9, stressLevel: 2, exerciseMinutes: 45, sunExposureMinutes: 30, dietTags: ["fruits_veggies"] },
  { userId: "user-1", date: new Date("2026-09-29"), sleepHours: 6, waterGlasses: 5, stressLevel: 4, exerciseMinutes: 0, sunExposureMinutes: 120, dietTags: ["sugar", "processed"] },
  { userId: "user-1", date: new Date("2026-09-30"), sleepHours: 8, waterGlasses: 10, stressLevel: 1, exerciseMinutes: 60, sunExposureMinutes: 20, dietTags: ["fruits_veggies", "supplements"] },
  { userId: "user-1", date: new Date("2026-10-01"), sleepHours: 7, waterGlasses: 8, stressLevel: 3, exerciseMinutes: 30, sunExposureMinutes: 45, dietTags: [] },
  { userId: "user-1", date: new Date("2026-10-02"), sleepHours: 7.5, waterGlasses: 9, stressLevel: 2, exerciseMinutes: 40, sunExposureMinutes: 30, dietTags: ["fruits_veggies"] },
];

const mockUser = {
  id: "user-1",
  supabaseId: "sub-1",
  email: "test@example.com",
  skinType: "COMBINATION",
  fitzpatrick: 3,
  ageRange: "TWENTIES",
  concerns: ["ACNE", "REDNESS"],
  allergies: [],
  isPregnant: false,
};

const mockPrisma = {
  scan: {
    findMany: jest.fn().mockResolvedValue(mockScans),
    findFirst: jest.fn().mockResolvedValue(mockScans[2]),
    count: jest.fn().mockResolvedValue(3),
  },
  user: {
    findUnique: jest.fn().mockResolvedValue(mockUser),
  },
  skinTrend: {
    upsert: jest.fn().mockResolvedValue({}),
  },
  cohortStats: {
    findUnique: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({}),
  },
  lifestyleLog: {
    findMany: jest.fn().mockResolvedValue(mockLifestyleLogs),
    count: jest.fn().mockResolvedValue(mockLifestyleLogs.length),
    upsert: jest.fn().mockImplementation((args: any) => Promise.resolve({
      id: "log-1",
      ...args.create,
    })),
  },
  achievement: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
    upsert: jest.fn().mockResolvedValue({}),
    updateMany: jest.fn().mockResolvedValue({}),
  },
  adherenceLog: {
    findMany: jest.fn().mockResolvedValue([]),
  },
};

describe("Phase 6: Longitudinal Intelligence", () => {
  let temporalService: TemporalAnalyticsService;
  let skinTwinService: SkinTwinService;
  let lifestyleService: LifestyleCorrelationService;
  let achievementService: AchievementService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemporalAnalyticsService,
        SkinTwinService,
        LifestyleCorrelationService,
        AchievementService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    temporalService = module.get(TemporalAnalyticsService);
    skinTwinService = module.get(SkinTwinService);
    lifestyleService = module.get(LifestyleCorrelationService);
    achievementService = module.get(AchievementService);
  });

  // ── Temporal Analytics ──

  describe("TemporalAnalyticsService", () => {
    it("builds a timeline with overall score history", async () => {
      const timeline = await temporalService.buildTimeline("user-1", "all");

      expect(timeline.totalScans).toBe(3);
      expect(timeline.overallScoreHistory).toHaveLength(3);
      expect(timeline.overallScoreHistory[0]!.value).toBe(65);
      expect(timeline.overallScoreHistory[2]!.value).toBe(78);
    });

    it("detects improving trends for declining severity values", async () => {
      const timeline = await temporalService.buildTimeline("user-1", "all");

      // Most concerns should be improving (severity going down)
      const improvingTrends = timeline.concernTrends.filter((t) => t.direction === "improving");
      expect(improvingTrends.length).toBeGreaterThan(0);
    });

    it("includes scan IDs in data points", async () => {
      const timeline = await temporalService.buildTimeline("user-1", "all");

      for (const dp of timeline.overallScoreHistory) {
        expect(dp.scanId).toBeDefined();
      }
    });

    it("returns dates in ISO format", async () => {
      const timeline = await temporalService.buildTimeline("user-1", "all");

      expect(timeline.firstScanDate).toContain("2026");
      expect(timeline.latestScanDate).toContain("2026");
    });

    it("caches trends to SkinTrend table", async () => {
      await temporalService.buildTimeline("user-1", "30d");

      expect(mockPrisma.skinTrend.upsert).toHaveBeenCalled();
    });
  });

  // ── Skin Twin ──

  describe("SkinTwinService", () => {
    it("returns a cohort profile with user demographics", async () => {
      const result = await skinTwinService.findSkinTwin("user-1");

      expect(result.cohort.fitzpatrick).toBe(3);
      expect(result.cohort.ageRange).toBe("TWENTIES");
      expect(result.cohort.cohortSize).toBeGreaterThan(0);
    });

    it("generates percentile rankings for key metrics", async () => {
      const result = await skinTwinService.findSkinTwin("user-1");

      expect(result.rankings.length).toBeGreaterThan(0);
      const healthRanking = result.rankings.find((r) => r.metric === "skinHealthScore");
      expect(healthRanking).toBeDefined();
      expect(healthRanking!.percentile).toBeGreaterThanOrEqual(0);
      expect(healthRanking!.percentile).toBeLessThanOrEqual(100);
    });

    it("provides what-worked product recommendations", async () => {
      const result = await skinTwinService.findSkinTwin("user-1");

      expect(result.whatWorked.length).toBeGreaterThan(0);
      expect(result.whatWorked[0]!.productName).toBeDefined();
      expect(result.whatWorked[0]!.successRate).toBeGreaterThan(0);
    });

    it("returns match confidence > 0", async () => {
      const result = await skinTwinService.findSkinTwin("user-1");
      expect(result.matchConfidence).toBeGreaterThan(0);
    });
  });

  // ── Lifestyle Correlation ──

  describe("LifestyleCorrelationService", () => {
    it("logs a check-in via upsert", async () => {
      const result = await lifestyleService.logCheckIn("user-1", {
        date: "2026-10-02",
        checkIn: {
          sleepHours: 7.5,
          waterGlasses: 9,
          stressLevel: 2,
          exerciseMinutes: 40,
          sunExposureMinutes: 30,
          dietTags: ["fruits_veggies"],
        },
      });

      expect(mockPrisma.lifestyleLog.upsert).toHaveBeenCalled();
      expect(result.sleepHours).toBe(7.5);
    });

    it("computes habit scores across 5 categories", async () => {
      const insights = await lifestyleService.computeInsights("user-1");

      expect(insights.habitScores).toHaveLength(5);
      const categories = insights.habitScores.map((h) => h.category);
      expect(categories).toContain("sleep");
      expect(categories).toContain("hydration");
      expect(categories).toContain("exercise");
      expect(categories).toContain("stress");
      expect(categories).toContain("sun_protection");
    });

    it("computes current and best check-in streaks", async () => {
      const insights = await lifestyleService.computeInsights("user-1");

      expect(insights.totalCheckIns).toBe(5);
      expect(insights.currentStreak).toBeGreaterThanOrEqual(1);
      expect(insights.bestStreak).toBeGreaterThanOrEqual(insights.currentStreak);
    });

    it("overall lifestyle score is 0-100", async () => {
      const insights = await lifestyleService.computeInsights("user-1");

      expect(insights.overallLifestyleScore).toBeGreaterThanOrEqual(0);
      expect(insights.overallLifestyleScore).toBeLessThanOrEqual(100);
    });
  });

  // ── Achievements ──

  describe("AchievementService", () => {
    it("returns all achievements with progress", async () => {
      const progress = await achievementService.getProgress("user-1");

      expect(progress.totalCount).toBeGreaterThan(0);
      expect(progress.achievements.length).toBe(progress.totalCount);
      expect(progress.level).toBeGreaterThanOrEqual(1);
    });

    it("evaluates achievements and detects newly unlocked", async () => {
      const newlyUnlocked = await achievementService.evaluateAchievements("user-1");

      // Should unlock at least "first_scan" since scanCount = 3
      expect(mockPrisma.achievement.upsert).toHaveBeenCalled();
    });

    it("marks achievements as seen", async () => {
      await achievementService.markSeen("user-1");
      expect(mockPrisma.achievement.updateMany).toHaveBeenCalledWith({
        where: { userId: "user-1", isNew: true },
        data: { isNew: false },
      });
    });

    it("level calculation uses XP thresholds", async () => {
      const progress = await achievementService.getProgress("user-1");

      expect(progress.level).toBeGreaterThanOrEqual(1);
      expect(progress.xpToNextLevel).toBeGreaterThan(0);
      expect(progress.xpToNextLevel).toBeLessThanOrEqual(250);
    });
  });
});
