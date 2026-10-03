import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type {
  LifestyleCorrelation,
  HabitScore,
  LifestyleInsights,
  CreateLifestyleLog,
  TrendDirection,
} from "@skinsense/types";

@Injectable()
export class LifestyleCorrelationService {
  private readonly logger = new Logger(LifestyleCorrelationService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Log a daily lifestyle check-in.
   */
  async logCheckIn(userId: string, data: CreateLifestyleLog): Promise<any> {
    return this.prisma.lifestyleLog.upsert({
      where: {
        userId_date: {
          userId,
          date: new Date(data.date),
        },
      },
      create: {
        userId,
        date: new Date(data.date),
        sleepHours: data.checkIn.sleepHours,
        waterGlasses: data.checkIn.waterGlasses,
        stressLevel: data.checkIn.stressLevel,
        exerciseMinutes: data.checkIn.exerciseMinutes,
        sunExposureMinutes: data.checkIn.sunExposureMinutes,
        dietTags: data.checkIn.dietTags,
        notes: data.checkIn.notes,
      },
      update: {
        sleepHours: data.checkIn.sleepHours,
        waterGlasses: data.checkIn.waterGlasses,
        stressLevel: data.checkIn.stressLevel,
        exerciseMinutes: data.checkIn.exerciseMinutes,
        sunExposureMinutes: data.checkIn.sunExposureMinutes,
        dietTags: data.checkIn.dietTags,
        notes: data.checkIn.notes,
      },
    });
  }

  /**
   * Retrieve all check-ins for a user within a date range.
   */
  async getCheckIns(userId: string, days = 30): Promise<any[]> {
    const cutoff = new Date(Date.now() - days * 86400000);
    return this.prisma.lifestyleLog.findMany({
      where: { userId, date: { gte: cutoff } },
      orderBy: { date: "desc" },
    });
  }

  /**
   * Compute lifestyle insights: correlations between check-in factors and
   * skin metric changes, plus habit scores and streaks.
   */
  async computeInsights(userId: string): Promise<LifestyleInsights> {
    const logs = await this.prisma.lifestyleLog.findMany({
      where: { userId },
      orderBy: { date: "asc" },
    });

    const scans = await this.prisma.scan.findMany({
      where: { userId, status: "COMPLETED" },
      include: { result: true },
      orderBy: { createdAt: "asc" },
    });

    const correlations = this.computeCorrelations(logs, scans);
    const habitScores = this.computeHabitScores(logs);
    const { currentStreak, bestStreak } = this.computeStreaks(logs);

    const overallLifestyleScore = habitScores.length > 0
      ? Math.round(habitScores.reduce((sum, h) => sum + h.score, 0) / habitScores.length)
      : 0;

    return {
      correlations,
      habitScores,
      overallLifestyleScore,
      totalCheckIns: logs.length,
      currentStreak,
      bestStreak,
    };
  }

  /**
   * Compute Pearson correlations between lifestyle factors and skin metrics.
   */
  private computeCorrelations(logs: any[], scans: any[]): LifestyleCorrelation[] {
    if (logs.length < 5 || scans.length < 2) return [];

    const correlations: LifestyleCorrelation[] = [];

    // Map scans to dates for nearest-match joining
    const scansByDate = new Map<string, any>();
    for (const scan of scans) {
      if (scan.result) {
        const dateKey = scan.createdAt.toISOString().split("T")[0]!;
        scansByDate.set(dateKey, scan.result);
      }
    }

    // Find nearest scan result for each lifestyle log (within ±3 days)
    const paired: { log: any; result: any }[] = [];
    for (const log of logs) {
      const logDate = log.date.getTime();
      let nearestResult: any = null;
      let nearestDist = Infinity;

      for (const scan of scans) {
        if (!scan.result) continue;
        const dist = Math.abs(scan.createdAt.getTime() - logDate);
        if (dist < nearestDist && dist < 3 * 86400000) {
          nearestDist = dist;
          nearestResult = scan.result;
        }
      }

      if (nearestResult) {
        paired.push({ log, result: nearestResult });
      }
    }

    if (paired.length < 3) return [];

    // Correlate each lifestyle factor with skin health score
    const factors: { key: string; label: string; threshold: string; extract: (l: any) => number }[] = [
      { key: "sleepHours", label: "Sleep", threshold: "≥ 7 hours", extract: (l) => l.sleepHours },
      { key: "waterGlasses", label: "Hydration", threshold: "≥ 8 glasses", extract: (l) => l.waterGlasses },
      { key: "stressLevel", label: "Stress", threshold: "≤ 2 (low)", extract: (l) => l.stressLevel },
      { key: "exerciseMinutes", label: "Exercise", threshold: "≥ 30 min", extract: (l) => l.exerciseMinutes },
      { key: "sunExposureMinutes", label: "Sun Exposure", threshold: "≤ 60 min", extract: (l) => l.sunExposureMinutes },
    ];

    const skinMetrics: { key: string; extract: (r: any) => number }[] = [
      { key: "skinHealthScore", extract: (r) => r.skinHealthScore },
      { key: "barrierScore", extract: (r) => r.barrierScore ?? 65 },
    ];

    for (const factor of factors) {
      for (const metric of skinMetrics) {
        const xs = paired.map((p) => factor.extract(p.log));
        const ys = paired.map((p) => metric.extract(p.result));

        const r = this.pearson(xs, ys);
        if (Math.abs(r) < 0.15) continue;

        const impact = this.generateImpactStatement(factor.label, factor.threshold, metric.key, r);

        correlations.push({
          factor: factor.key,
          threshold: factor.threshold,
          skinMetric: metric.key,
          correlationStrength: Math.round(r * 100) / 100,
          direction: r > 0 ? "positive" : "negative",
          impact,
          confidence: Math.abs(r) > 0.5 ? "high" : Math.abs(r) > 0.3 ? "medium" : "low",
          dataPointCount: paired.length,
        });
      }
    }

    // Sort by absolute correlation strength
    correlations.sort((a, b) => Math.abs(b.correlationStrength) - Math.abs(a.correlationStrength));
    return correlations.slice(0, 8);
  }

  /**
   * Pearson correlation coefficient.
   */
  private pearson(xs: number[], ys: number[]): number {
    const n = xs.length;
    if (n < 3) return 0;

    const meanX = xs.reduce((a, b) => a + b, 0) / n;
    const meanY = ys.reduce((a, b) => a + b, 0) / n;

    let num = 0, denX = 0, denY = 0;
    for (let i = 0; i < n; i++) {
      const dx = xs[i]! - meanX;
      const dy = ys[i]! - meanY;
      num += dx * dy;
      denX += dx * dx;
      denY += dy * dy;
    }

    const den = Math.sqrt(denX * denY);
    return den > 0 ? num / den : 0;
  }

  /**
   * Generate a human-readable impact statement.
   */
  private generateImpactStatement(factor: string, threshold: string, metric: string, r: number): string {
    const metricLabel = metric === "skinHealthScore" ? "skin health" : "barrier health";
    const direction = r > 0 ? "improves" : "worsens";
    const pct = Math.round(Math.abs(r) * 25);

    if (factor === "Stress") {
      return r > 0
        ? `Higher stress is associated with ${pct}% lower ${metricLabel}`
        : `Lower stress correlates with ${pct}% better ${metricLabel}`;
    }

    return `When ${factor.toLowerCase()} meets ${threshold}, ${metricLabel} ${direction} by ~${pct}%`;
  }

  /**
   * Compute habit scores from lifestyle logs.
   */
  private computeHabitScores(logs: any[]): HabitScore[] {
    if (logs.length === 0) return [];

    const recent = logs.slice(-30); // Last 30 logs

    const categories: { category: string; extract: (l: any) => number; goodThreshold: number; invert?: boolean }[] = [
      { category: "sleep", extract: (l) => l.sleepHours, goodThreshold: 7 },
      { category: "hydration", extract: (l) => l.waterGlasses, goodThreshold: 8 },
      { category: "exercise", extract: (l) => l.exerciseMinutes, goodThreshold: 30 },
      { category: "stress", extract: (l) => l.stressLevel, goodThreshold: 3, invert: true },
      { category: "sun_protection", extract: (l) => l.sunExposureMinutes, goodThreshold: 90, invert: true },
    ];

    return categories.map(({ category, extract, goodThreshold, invert }) => {
      const values = recent.map(extract);
      const goodDays = values.filter((v) =>
        invert ? v <= goodThreshold : v >= goodThreshold
      ).length;

      const score = Math.round((goodDays / recent.length) * 100);

      // Streak calculation
      let streak = 0;
      for (let i = recent.length - 1; i >= 0; i--) {
        const val = extract(recent[i]!);
        const isGood = invert ? val <= goodThreshold : val >= goodThreshold;
        if (isGood) streak++;
        else break;
      }

      // Best streak
      let bestStreak = 0;
      let currentBest = 0;
      for (const log of logs) {
        const val = extract(log);
        const isGood = invert ? val <= goodThreshold : val >= goodThreshold;
        if (isGood) {
          currentBest++;
          bestStreak = Math.max(bestStreak, currentBest);
        } else {
          currentBest = 0;
        }
      }

      // Trend
      const firstHalf = values.slice(0, Math.floor(values.length / 2));
      const secondHalf = values.slice(Math.floor(values.length / 2));
      const avgFirst = firstHalf.length > 0 ? firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length : 0;
      const avgSecond = secondHalf.length > 0 ? secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length : 0;
      const diff = invert ? avgFirst - avgSecond : avgSecond - avgFirst;

      let trend: TrendDirection = "stable";
      if (diff > 0.5) trend = "improving";
      else if (diff < -0.5) trend = "declining";

      return { category, score, streak, bestStreak, trend };
    });
  }

  /**
   * Compute consecutive daily check-in streaks.
   */
  private computeStreaks(logs: any[]): { currentStreak: number; bestStreak: number } {
    if (logs.length === 0) return { currentStreak: 0, bestStreak: 0 };

    const dates = logs.map((l) => l.date.toISOString().split("T")[0]!).sort();
    const uniqueDates = [...new Set(dates)];

    let currentStreak = 1;
    let bestStreak = 1;
    let streak = 1;

    for (let i = uniqueDates.length - 1; i > 0; i--) {
      const curr = new Date(uniqueDates[i]!).getTime();
      const prev = new Date(uniqueDates[i - 1]!).getTime();
      if (curr - prev === 86400000) {
        streak++;
      } else {
        break;
      }
    }
    currentStreak = streak;

    streak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const curr = new Date(uniqueDates[i]!).getTime();
      const prev = new Date(uniqueDates[i - 1]!).getTime();
      if (curr - prev === 86400000) {
        streak++;
        bestStreak = Math.max(bestStreak, streak);
      } else {
        streak = 1;
      }
    }

    return { currentStreak, bestStreak: Math.max(bestStreak, currentStreak) };
  }
}
