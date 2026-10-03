import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Phase 6 test data for user-1...");

  // 1. Ensure User exists
  const user = await prisma.user.upsert({
    where: { id: "user-1" },
    update: {
      fitzpatrick: 3,
      ageRange: "TWENTIES",
      concerns: ["ACNE", "REDNESS"],
      skinType: "OILY",
    },
    create: {
      id: "user-1",
      supabaseId: "user-1-sub",
      email: "user1@skinsense.ai",
      fitzpatrick: 3,
      ageRange: "TWENTIES",
      concerns: ["ACNE", "REDNESS"],
      skinType: "OILY",
    },
  });
  console.log("User ready:", user.id);

  // 2. Seed 5 completed Scans over 30 days
  const now = new Date();
  const scanData = [
    { daysAgo: 28, score: 65, acne: 68, barrier: 50 },
    { daysAgo: 21, score: 68, acne: 62, barrier: 54 },
    { daysAgo: 14, score: 74, acne: 50, barrier: 62 },
    { daysAgo: 7,  score: 72, acne: 52, barrier: 60 },
    { daysAgo: 1,  score: 78, acne: 42, barrier: 68 },
  ];

  for (let i = 0; i < scanData.length; i++) {
    const s = scanData[i];
    const scanDate = new Date(now.getTime() - s.daysAgo * 86400000);
    const scanId = `scan-demo-${i + 1}`;

    const scan = await prisma.scan.upsert({
      where: { id: scanId },
      update: {
        status: "COMPLETED",
        createdAt: scanDate,
      },
      create: {
        id: scanId,
        userId: user.id,
        status: "COMPLETED",
        imageKeys: ["demo.jpg"],
        questionnaire: { skinType: "OILY", topConcern: "ACNE" },
        createdAt: scanDate,
      },
    });

    await prisma.scanResult.upsert({
      where: { scanId },
      update: {
        skinHealthScore: s.score,
        barrierScore: s.barrier,
        createdAt: scanDate,
      },
      create: {
        scanId,
        skinHealthScore: s.score,
        barrierScore: s.barrier,
        zoneScores: {
          forehead: { acne: s.acne, redness: 25 },
          leftCheek: { acne: s.acne + 4, redness: 20 },
          rightCheek: { acne: s.acne + 2, redness: 22 },
          nose: { oiliness: 60, texture: 40 },
          chin: { acne: s.acne - 5, redness: 18 },
        },
        findings: [
          { zone: "forehead", concern: "acne", severity: s.acne > 50 ? "MODERATE" : "MILD", confidence: 0.88 },
          { zone: "leftCheek", concern: "acne", severity: s.acne > 50 ? "MODERATE" : "MILD", confidence: 0.85 },
        ],
        metadata: { quality: 0.95 },
        modelVersion: "v2.0",
        processingTimeMs: 420,
        createdAt: scanDate,
      },
    });
  }
  console.log("Seeded 5 demo scans and results");

  // 3. Seed 14 daily Lifestyle Logs
  const lifestyleCheckIns = [
    { daysAgo: 13, sleep: 7.5, water: 8, stress: 2, ex: 30, sun: 20, diet: ["fruits_veggies", "water_rich"] },
    { daysAgo: 12, sleep: 6.0, water: 5, stress: 4, ex: 0,  sun: 45, diet: ["sugar", "caffeine"] },
    { daysAgo: 11, sleep: 8.0, water: 9, stress: 1, ex: 45, sun: 15, diet: ["fruits_veggies", "supplements"] },
    { daysAgo: 10, sleep: 7.0, water: 7, stress: 3, ex: 20, sun: 30, diet: ["gluten"] },
    { daysAgo: 9,  sleep: 7.5, water: 8, stress: 2, ex: 30, sun: 25, diet: ["water_rich", "fruits_veggies"] },
    { daysAgo: 8,  sleep: 6.5, water: 6, stress: 3, ex: 15, sun: 35, diet: ["dairy", "sugar"] },
    { daysAgo: 7,  sleep: 8.5, water: 10, stress: 1, ex: 60, sun: 10, diet: ["fruits_veggies", "supplements"] },
    { daysAgo: 6,  sleep: 7.0, water: 8, stress: 2, ex: 30, sun: 20, diet: ["water_rich"] },
    { daysAgo: 5,  sleep: 7.5, water: 8, stress: 2, ex: 25, sun: 30, diet: ["fruits_veggies"] },
    { daysAgo: 4,  sleep: 8.0, water: 9, stress: 1, ex: 40, sun: 15, diet: ["supplements", "fruits_veggies"] },
    { daysAgo: 3,  sleep: 7.0, water: 7, stress: 3, ex: 0,  sun: 40, diet: ["caffeine", "sugar"] },
    { daysAgo: 2,  sleep: 8.0, water: 8, stress: 2, ex: 30, sun: 20, diet: ["water_rich"] },
    { daysAgo: 1,  sleep: 7.5, water: 9, stress: 2, ex: 45, sun: 25, diet: ["fruits_veggies", "supplements"] },
    { daysAgo: 0,  sleep: 8.0, water: 8, stress: 1, ex: 35, sun: 15, diet: ["fruits_veggies", "water_rich"] },
  ];

  for (const c of lifestyleCheckIns) {
    const logDate = new Date(now.getTime() - c.daysAgo * 86400000);
    logDate.setUTCHours(0, 0, 0, 0);

    await prisma.lifestyleLog.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: logDate,
        },
      },
      update: {
        sleepHours: c.sleep,
        waterGlasses: c.water,
        stressLevel: c.stress,
        exerciseMinutes: c.ex,
        sunExposureMinutes: c.sun,
        dietTags: c.diet,
      },
      create: {
        userId: user.id,
        date: logDate,
        sleepHours: c.sleep,
        waterGlasses: c.water,
        stressLevel: c.stress,
        exerciseMinutes: c.ex,
        sunExposureMinutes: c.sun,
        dietTags: c.diet,
      },
    });
  }
  console.log("Seeded 14 lifestyle logs");

  // 4. Seed CohortStats
  await prisma.cohortStats.upsert({
    where: {
      fitzpatrick_ageRange_concern_metric: {
        fitzpatrick: 3,
        ageRange: "TWENTIES",
        concern: "ACNE",
        metric: "skinHealthScore",
      },
    },
    update: {
      p25: 55,
      median: 68,
      p75: 80,
      sampleSize: 1247,
    },
    create: {
      fitzpatrick: 3,
      ageRange: "TWENTIES",
      concern: "ACNE",
      metric: "skinHealthScore",
      p25: 55,
      median: 68,
      p75: 80,
      sampleSize: 1247,
      topProducts: [
        { productName: "CeraVe Hydrating Cleanser", productCategory: "CLEANSER", successRate: 0.78, usersWhoImproved: 892, avgImprovement: 12, topConcern: "ACNE" },
        { productName: "La Roche-Posay SPF 50", productCategory: "SPF", successRate: 0.85, usersWhoImproved: 1203, avgImprovement: 8, topConcern: "REDNESS" },
        { productName: "The Ordinary Niacinamide 10%", productCategory: "SERUM", successRate: 0.72, usersWhoImproved: 756, avgImprovement: 15, topConcern: "ACNE" },
      ],
    },
  });

  await prisma.cohortStats.upsert({
    where: {
      fitzpatrick_ageRange_concern_metric: {
        fitzpatrick: 3,
        ageRange: "TWENTIES",
        concern: "ACNE",
        metric: "barrierScore",
      },
    },
    update: {
      p25: 45,
      median: 62,
      p75: 78,
      sampleSize: 1247,
    },
    create: {
      fitzpatrick: 3,
      ageRange: "TWENTIES",
      concern: "ACNE",
      metric: "barrierScore",
      p25: 45,
      median: 62,
      p75: 78,
      sampleSize: 1247,
    },
  });
  console.log("Seeded CohortStats");

  // 5. Seed initial achievements
  const badges = [
    { id: "first_scan", progress: 1, unlocked: true },
    { id: "scans_5", progress: 1, unlocked: true },
    { id: "routine_3day", progress: 1, unlocked: true },
    { id: "checkin_3day", progress: 1, unlocked: true },
    { id: "score_improvement", progress: 1, unlocked: true },
    { id: "checkin_first", progress: 1, unlocked: true },
    { id: "score_improve_5", progress: 1, unlocked: true },
    { id: "routine_7day", progress: 0.8, unlocked: false },
    { id: "checkin_7day", progress: 1, unlocked: true },
  ];

  for (const b of badges) {
    await prisma.achievement.upsert({
      where: {
        userId_achievementId: {
          userId: user.id,
          achievementId: b.id,
        },
      },
      update: {
        progress: b.progress,
        unlockedAt: b.unlocked ? new Date() : null,
        isNew: b.unlocked,
      },
      create: {
        userId: user.id,
        achievementId: b.id,
        progress: b.progress,
        unlockedAt: b.unlocked ? new Date() : null,
        isNew: b.unlocked,
      },
    });
  }
  console.log("Seeded Achievements");
  console.log("Database seeded successfully for Phase 6!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
