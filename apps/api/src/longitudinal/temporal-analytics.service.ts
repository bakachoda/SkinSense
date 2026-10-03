import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type {
  TrendDirection,
  TrendDataPoint,
  ConcernTrend,
  Breakpoint,
  SeasonalPattern,
  SkinTimeline,
  TrendWindow,
} from "@skinsense/types";

@Injectable()
export class TemporalAnalyticsService {
  private readonly logger = new Logger(TemporalAnalyticsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Build the full skin timeline for a user: score history, per-concern trends,
   * breakpoints, and seasonal patterns.
   */
  async buildTimeline(userId: string, window: TrendWindow = "30d"): Promise<SkinTimeline> {
    const scans = await this.prisma.scan.findMany({
      where: { userId, status: "COMPLETED" },
      include: { result: true },
      orderBy: { createdAt: "asc" },
    });

    if (scans.length === 0) {
      return {
        overallScoreHistory: [],
        concernTrends: [],
        breakpoints: [],
        seasonalPatterns: [],
        totalScans: 0,
        firstScanDate: new Date().toISOString(),
        latestScanDate: new Date().toISOString(),
      };
    }

    const windowMs = this.windowToMs(window);
    const cutoff = window === "all" ? 0 : Date.now() - windowMs;
    const filteredScans = scans.filter((s) => s.createdAt.getTime() >= cutoff);

    // Overall score history
    const overallScoreHistory: TrendDataPoint[] = filteredScans
      .filter((s) => s.result)
      .map((s) => ({
        date: s.createdAt.toISOString(),
        value: s.result!.skinHealthScore,
        scanId: s.id,
      }));

    // Per-zone, per-concern trends
    const zones = ["forehead", "nose", "left_cheek", "right_cheek", "chin", "periorbital"];
    const concerns = ["acne", "redness", "pigmentation", "texture", "dryness", "oiliness"];
    const concernTrends: ConcernTrend[] = [];

    for (const zone of zones) {
      for (const concern of concerns) {
        const dataPoints: TrendDataPoint[] = filteredScans
          .filter((s) => s.result)
          .map((s) => {
            const zoneScores = s.result!.zoneScores as Record<string, Record<string, number>>;
            const value = zoneScores?.[zone]?.[concern] ?? 0;
            return { date: s.createdAt.toISOString(), value, scanId: s.id };
          })
          .filter((dp) => dp.value > 0);

        if (dataPoints.length < 2) continue;

        const trend = this.computeTrend(dataPoints);
        if (trend.confidence > 0.3) {
          concernTrends.push({ ...trend, concern, zone });
        }
      }
    }

    // Breakpoints
    const breakpoints = this.detectBreakpoints(filteredScans);

    // Seasonal patterns (only meaningful with 90d+ of data)
    const seasonalPatterns = scans.length >= 4 ? this.detectSeasonalPatterns(scans) : [];

    // Cache trends to database
    await this.cacheTrends(userId, concernTrends, window);

    return {
      overallScoreHistory,
      concernTrends,
      breakpoints,
      seasonalPatterns,
      totalScans: scans.length,
      firstScanDate: scans[0]!.createdAt.toISOString(),
      latestScanDate: scans[scans.length - 1]!.createdAt.toISOString(),
    };
  }

  /**
   * Compute trend direction and slope from a series of data points using
   * linear regression (least squares).
   */
  private computeTrend(dataPoints: TrendDataPoint[]): Omit<ConcernTrend, "concern" | "zone"> {
    const n = dataPoints.length;
    const firstDate = new Date(dataPoints[0]!.date).getTime();

    // Convert dates to day offsets
    const xs = dataPoints.map((dp) => (new Date(dp.date).getTime() - firstDate) / 86400000);
    const ys = dataPoints.map((dp) => dp.value);

    // Least squares linear regression
    const sumX = xs.reduce((a, b) => a + b, 0);
    const sumY = ys.reduce((a, b) => a + b, 0);
    const sumXY = xs.reduce((a, x, i) => a + x * ys[i]!, 0);
    const sumX2 = xs.reduce((a, x) => a + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX || 1);
    const meanY = sumY / n;

    // R² for confidence
    const yHat = xs.map((x) => slope * x + (meanY - slope * (sumX / n)));
    const ssTot = ys.reduce((a, y) => a + (y - meanY) ** 2, 0);
    const ssRes = ys.reduce((a, y, i) => a + (y - yHat[i]!) ** 2, 0);
    const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0;

    // Volatility check (coefficient of variation)
    const stdDev = Math.sqrt(ys.reduce((a, y) => a + (y - meanY) ** 2, 0) / n);
    const cv = meanY > 0 ? stdDev / meanY : 0;

    const currentValue = ys[ys.length - 1]!;
    const previousValue = ys[0]!;
    const delta = currentValue - previousValue;

    let direction: TrendDirection;
    if (cv > 0.35 && r2 < 0.3) {
      direction = "volatile";
    } else if (Math.abs(slope) < 0.5) {
      direction = "stable";
    } else if (slope < 0) {
      direction = "improving"; // Lower severity = improving
    } else {
      direction = "declining";
    }

    return {
      direction,
      slope: Math.round(slope * 100) / 100,
      dataPoints,
      currentValue,
      previousValue,
      delta,
      confidence: Math.round(Math.max(0, Math.min(1, r2)) * 100) / 100,
    };
  }

  /**
   * Detect inflection points in overall skin health scores.
   */
  private detectBreakpoints(scans: any[]): Breakpoint[] {
    const breakpoints: Breakpoint[] = [];
    const results = scans.filter((s) => s.result);

    for (let i = 1; i < results.length - 1; i++) {
      const prev = results[i - 1]!.result!.skinHealthScore;
      const curr = results[i]!.result!.skinHealthScore;
      const next = results[i + 1]!.result!.skinHealthScore;

      // Peak: score goes up then down
      if (curr > prev + 3 && curr > next + 3) {
        breakpoints.push({
          date: results[i]!.createdAt.toISOString(),
          concern: "skinHealthScore",
          zone: "overall",
          type: "peak",
          valueBefore: prev,
          valueAfter: next,
          possibleCause: this.inferCause(results[i]!, "peak"),
        });
      }

      // Valley: score goes down then up
      if (curr < prev - 3 && curr < next - 3) {
        breakpoints.push({
          date: results[i]!.createdAt.toISOString(),
          concern: "skinHealthScore",
          zone: "overall",
          type: "valley",
          valueBefore: prev,
          valueAfter: next,
          possibleCause: this.inferCause(results[i]!, "valley"),
        });
      }
    }

    return breakpoints;
  }

  /**
   * Infer a possible cause for a breakpoint based on metadata.
   */
  private inferCause(scan: any, type: "peak" | "valley"): string {
    if (type === "valley") {
      return "Skin stress detected — possibly environmental or routine change";
    }
    return "Positive response — routine adaptation may be working";
  }

  /**
   * Detect seasonal patterns across all scans.
   */
  private detectSeasonalPatterns(scans: any[]): SeasonalPattern[] {
    const monthlyScores: Record<number, number[]> = {};
    for (const scan of scans) {
      if (!scan.result) continue;
      const month = scan.createdAt.getMonth() + 1;
      if (!monthlyScores[month]) monthlyScores[month] = [];
      monthlyScores[month]!.push(scan.result.skinHealthScore);
    }

    const monthAvgs: Record<number, number> = {};
    for (const [month, scores] of Object.entries(monthlyScores)) {
      monthAvgs[parseInt(month)] = scores.reduce((a, b) => a + b, 0) / scores.length;
    }

    const months = Object.keys(monthAvgs).map(Number);
    if (months.length < 3) return [];

    const peakMonth = months.reduce((a, b) => (monthAvgs[a]! > monthAvgs[b]! ? a : b));
    const troughMonth = months.reduce((a, b) => (monthAvgs[a]! < monthAvgs[b]! ? a : b));
    const amplitude = (monthAvgs[peakMonth]! - monthAvgs[troughMonth]!);

    if (amplitude < 5) return [];

    const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return [
      {
        concern: "skinHealthScore",
        peakMonth,
        troughMonth,
        amplitude: Math.round(amplitude),
        description: `Skin health tends to peak in ${monthNames[peakMonth]} and dip in ${monthNames[troughMonth]}`,
      },
    ];
  }

  /**
   * Cache computed trends to the SkinTrend table for fast retrieval.
   */
  private async cacheTrends(userId: string, trends: ConcernTrend[], window: TrendWindow): Promise<void> {
    for (const trend of trends) {
      await this.prisma.skinTrend.upsert({
        where: {
          userId_zone_concern_window: {
            userId,
            zone: trend.zone,
            concern: trend.concern,
            window,
          },
        },
        create: {
          userId,
          zone: trend.zone,
          concern: trend.concern,
          direction: trend.direction,
          slope: trend.slope,
          currentValue: trend.currentValue,
          previousValue: trend.previousValue,
          delta: trend.delta,
          confidence: trend.confidence,
          window,
          dataPoints: trend.dataPoints as any,
        },
        update: {
          direction: trend.direction,
          slope: trend.slope,
          currentValue: trend.currentValue,
          previousValue: trend.previousValue,
          delta: trend.delta,
          confidence: trend.confidence,
          dataPoints: trend.dataPoints as any,
          computedAt: new Date(),
        },
      });
    }
  }

  private windowToMs(window: TrendWindow): number {
    switch (window) {
      case "7d": return 7 * 86400000;
      case "30d": return 30 * 86400000;
      case "90d": return 90 * 86400000;
      case "all": return Infinity;
    }
  }
}
