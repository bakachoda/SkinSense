import { Injectable } from "@nestjs/common";
import type {
  BarrierInputs,
  BarrierHealthResult,
  ProductCategory,
} from "@skinsense/types";

@Injectable()
export class BarrierService {
  /**
   * Compute composite barrier health score (0-100) and enforce gatekeeping lockout (Phase 4, Section 8)
   */
  computeBarrierHealth(
    inputs: BarrierInputs,
    previousBarrierScores: number[] = [],
  ): BarrierHealthResult {
    const weights = {
      dehydrationTexture: 0.25,
      oilDehydrationRatio: 0.15,
      sensitivityReport: 0.10,
      waterHardness: 0.10,
      productStrippingRisk: 0.15,
      weatherStress: 0.10,
      rPPGIrritation: 0.15,
    };

    const impairmentRaw =
      (inputs.dehydrationTexture || 0) * weights.dehydrationTexture +
      (inputs.oilDehydrationRatio || 0) * weights.oilDehydrationRatio +
      (inputs.sensitivityReport || 0) * weights.sensitivityReport +
      (inputs.waterHardness || 0) * weights.waterHardness +
      (inputs.productStrippingRisk || 0) * weights.productStrippingRisk +
      (inputs.weatherStress || 0) * weights.weatherStress +
      (inputs.rPPGIrritation || 0) * weights.rPPGIrritation;

    // Score: 100 = perfect barrier, 0 = severely compromised
    const score = Math.max(0, Math.min(100, Math.round(100 - impairmentRaw)));

    let status: BarrierHealthResult["status"];
    if (score >= 75) {
      status = "OPTIMAL";
    } else if (score >= 60) {
      status = "HEALTHY";
    } else if (score >= 40) {
      status = "VULNERABLE";
    } else {
      status = "COMPROMISED";
    }

    // Temporal Hysteresis Check (Phase 4, Section 12):
    // If user was previously compromised (<40), score must sustain >= 60 for 2 consecutive scans
    // to unlock potent actives without triggering barrier relapse.
    const wasRecentlyCompromised = previousBarrierScores.some((s) => s < 40);
    const consecutiveHealthy = previousBarrierScores.filter((s) => s >= 60).length + (score >= 60 ? 1 : 0);

    const isLockedOut = score < 40 || (wasRecentlyCompromised && consecutiveHealthy < 2);

    let lockoutReason: string | undefined;
    let allowedCategories: ProductCategory[];
    let restrictedIngredients: string[];

    if (isLockedOut) {
      lockoutReason =
        score < 40
          ? "Stratum corneum lipid barrier compromised (Score < 40). Potent exfoliating acids and retinoids are strictly suspended until cellular integrity is restored."
          : "Barrier recovery in progress. Actives remain paused until barrier score stabilizes above 60 across 2 consecutive scans (temporal hysteresis safety protocol).";

      allowedCategories = ["CLEANSER", "MOISTURIZER", "SPF"];
      restrictedIngredients = [
        "Retinol",
        "Tretinoin",
        "Glycolic Acid",
        "Salicylic Acid",
        "Benzoyl Peroxide",
        "L-Ascorbic Acid",
      ];
    } else {
      allowedCategories = [
        "CLEANSER",
        "TONER",
        "SERUM",
        "MOISTURIZER",
        "SPF",
        "TREATMENT",
        "EYE_CREAM",
      ];
      restrictedIngredients = [];
    }

    return {
      score,
      status,
      isLockedOut,
      lockoutReason,
      allowedCategories,
      restrictedIngredients,
      consecutiveHealthyScans: consecutiveHealthy,
    };
  }
}
