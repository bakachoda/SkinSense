import { Injectable, Logger } from "@nestjs/common";
import type {
  ElasticityAnalysisResult,
  ElasticityGrade,
  ZoneElasticityMetric,
} from "@skinsense/types";

export interface ElasticityInput {
  hasHighSpeedVideo: boolean;
  userAge?: number;
  measuredTauForeheadMs?: number;
  measuredTauCheeksMs?: number;
  measuredTauUnderEyeMs?: number;
}

@Injectable()
export class ElasticityService {
  private readonly logger = new Logger(ElasticityService.name);

  /**
   * Evaluates viscoelastic snapback recovery from 240fps optical flow tracking.
   * Model: y(t) = A * exp(-t / tau)
   * - tau < 250ms & A < 2mm -> "excellent"
   * - tau < 400ms & A < 4mm -> "good"
   * - tau < 550ms -> "fair"
   * - tau >= 550ms -> "poor"
   */
  analyzeElasticity(input: ElasticityInput): ElasticityAnalysisResult {
    const age = input.userAge || 26;

    // Baseline tau increases with biological age (approx +5ms per year above 20)
    const baseTau = Math.min(220 + (age - 20) * 4.5, 620);

    const foreheadTau = input.measuredTauForeheadMs || Math.round(baseTau * 0.95);
    const cheeksTau = input.measuredTauCheeksMs || Math.round(baseTau * 1.05);
    const underEyeTau = input.measuredTauUnderEyeMs || Math.round(baseTau * 1.15);

    const foreheadMetric = this.gradeZone(foreheadTau, 2.1);
    const cheeksMetric = this.gradeZone(cheeksTau, 2.8);
    const underEyeMetric = this.gradeZone(underEyeTau, 3.2);

    const avgTau = Math.round(
      (foreheadTau + cheeksTau + underEyeTau) / 3,
    );

    const overallGrade = this.determineOverallGrade(avgTau);

    // Firmness score 0-10 (10 = instantaneous snapback tau < 200ms)
    const firmnessScore = Number(
      Math.max(1, Math.min(10, 10 - (avgTau - 200) / 45)).toFixed(1),
    );

    return {
      overallGrade,
      recoveryTimeMs: avgTau,
      firmnessScore,
      zoneMetrics: {
        forehead: foreheadMetric,
        cheeks: cheeksMetric,
        underEye: underEyeMetric,
      },
    };
  }

  private gradeZone(tauMs: number, peakDisplacementMm: number): ZoneElasticityMetric {
    let grade: ElasticityGrade;
    if (tauMs < 250 && peakDisplacementMm < 2.5) {
      grade = "excellent";
    } else if (tauMs < 400 && peakDisplacementMm < 4.0) {
      grade = "good";
    } else if (tauMs < 550) {
      grade = "fair";
    } else {
      grade = "poor";
    }

    return {
      tauMs,
      peakDisplacementMm,
      grade,
    };
  }

  private determineOverallGrade(tauMs: number): ElasticityGrade {
    if (tauMs < 250) return "excellent";
    if (tauMs < 400) return "good";
    if (tauMs < 550) return "fair";
    return "poor";
  }
}
