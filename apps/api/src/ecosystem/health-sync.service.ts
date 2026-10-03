import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  HealthSyncPayload,
  DerivedHealthSignals,
  SleepData,
  HRVData,
} from "@skinsense/types";

@Injectable()
export class HealthSyncService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ingests health platform data and computes derived, non-invasive cutaneous signals.
   */
  async syncHealthData(userId: string, payload: HealthSyncPayload): Promise<DerivedHealthSignals> {
    const derived = this.computeDerivedSignals(payload);

    // Persist summary log
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const latestSleep = payload.sleep && payload.sleep.length > 0
      ? payload.sleep[payload.sleep.length - 1]
      : null;
    const latestHrv = payload.hrv && payload.hrv.length > 0
      ? payload.hrv[payload.hrv.length - 1]
      : null;

    await this.prisma.healthSyncLog.create({
      data: {
        userId,
        date: today,
        sleepHours: latestSleep?.durationHours ?? derived.avgSleepHours,
        sleepQuality: latestSleep?.quality ?? derived.sleepQualitySummary,
        hrvAvgMs: latestHrv?.avgMs ?? null,
        hrvTrend: latestHrv?.trend ?? null,
        cyclePhase: payload.cycle?.phase ?? null,
        stepsCount: payload.steps?.[0]?.count ?? null,
        rawPayloadSummary: {
          stressIndicator: derived.stressIndicator,
          hormonalRisk: derived.hormonalAcneRisk,
        },
      },
    });

    return derived;
  }

  /**
   * Prepares the latest skin health score for export back to Apple Health / Health Connect.
   */
  async getScoreForHealthAppExport(userId: string): Promise<{ score: number; date: string }> {
    const latestScan = await this.prisma.scan.findFirst({
      where: { userId, status: "COMPLETED" },
      include: { result: true },
      orderBy: { createdAt: "desc" },
    });

    const score = (latestScan?.result as any)?.skinHealthScore || 75;
    return {
      score,
      date: latestScan?.createdAt.toISOString() || new Date().toISOString(),
    };
  }

  /**
   * Computes derived health signals from raw time-series.
   */
  computeDerivedSignals(payload: HealthSyncPayload): DerivedHealthSignals {
    let avgSleepHours = 7.5;
    let sleepQualitySummary: "poor" | "fair" | "good" = "good";

    if (payload.sleep && payload.sleep.length > 0) {
      const total = payload.sleep.reduce((acc, s) => acc + s.durationHours, 0);
      avgSleepHours = Number((total / payload.sleep.length).toFixed(1));

      if (avgSleepHours < 6.0) {
        sleepQualitySummary = "poor";
      } else if (avgSleepHours < 7.0) {
        sleepQualitySummary = "fair";
      } else {
        sleepQualitySummary = "good";
      }
    }

    let stressIndicator: "low" | "moderate" | "high" = "low";
    if (payload.hrv && payload.hrv.length > 0) {
      const decreasingCount = payload.hrv.filter((h) => h.trend === "decreasing" || h.avgMs < 40).length;
      if (decreasingCount >= 2) {
        stressIndicator = "high";
      } else if (decreasingCount === 1) {
        stressIndicator = "moderate";
      }
    }

    const cyclePhase = payload.cycle?.phase;
    const hormonalAcneRisk = cyclePhase === "luteal" || payload.cycle?.predictedFlareRisk === "high";

    const suggestedScoreContext: string[] = [];
    if (sleepQualitySummary === "poor") {
      suggestedScoreContext.push("Sub-optimal sleep (<6h) may exacerbate periorbital dark circles and cutaneous dullness.");
    }
    if (stressIndicator === "high") {
      suggestedScoreContext.push("Elevated sympathetic stress (low HRV) elevates cortisol, increasing follicular sebum production.");
    }
    if (hormonalAcneRisk) {
      suggestedScoreContext.push("Luteal phase detected: progesterone surge increases androgenic activity on chin/jawline.");
    }

    return {
      avgSleepHours,
      sleepQualitySummary,
      stressIndicator,
      cyclePhase,
      hormonalAcneRisk,
      suggestedScoreContext,
    };
  }
}
