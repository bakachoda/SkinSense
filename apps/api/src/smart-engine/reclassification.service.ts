import { Injectable } from "@nestjs/common";
import type { SkinType } from "@skinsense/types";
import type { MeasuredSkinProfile } from "@skinsense/types";

@Injectable()
export class ReclassificationService {
  /**
   * Compare measured biophysical data (specular oiliness + texture hydration)
   * against self-reported skin type to catch clinical misdiagnoses (Phase 4, Section 2)
   */
  reclassifySkinType(
    selfReported: SkinType | string,
    oilinessScore: number,
    hydrationScore: number,
    sensitivityScore: number,
    previousScansHistory?: { measuredType: string; date: string }[],
  ): MeasuredSkinProfile {
    const normalizedReported = (selfReported || "COMBINATION") as SkinType;
    let measuredType: "OILY" | "DRY" | "COMBINATION" | "NORMAL" | "DEHYDRATED_OILY";
    let discrepancy = false;
    let explanation: string | undefined;

    // 1. Most common clinical misdiagnosis: Dehydrated-Oily
    // User strips skin thinking it is oily, but low hydration triggers reactive hyper-sebum
    if (oilinessScore > 60 && hydrationScore < 40) {
      measuredType = "DEHYDRATED_OILY";
      discrepancy = normalizedReported !== "COMBINATION" && normalizedReported !== "OILY";
      explanation =
        "High surface oiliness with low epidermal hydration indicates dehydrated-oily skin. Stripping cleansers worsen this — introduce humectants like hyaluronic acid and glycerin to rebalance sebum.";
    }
    // 2. Self-reported "Dry" but actually Normal
    else if (oilinessScore >= 25 && oilinessScore <= 45 && hydrationScore > 55) {
      measuredType = "NORMAL";
      if (normalizedReported === "DRY") {
        discrepancy = true;
        explanation =
          "Your skin barrier retains healthy hydration with balanced lipid production. Heavy occlusives may be unneeded; lighter moisturizers will maintain optimal equilibrium.";
      }
    }
    // 3. True Dry
    else if (oilinessScore < 25 && hydrationScore < 45) {
      measuredType = "DRY";
      if (normalizedReported !== "DRY") {
        discrepancy = true;
        explanation =
          "Sub-optimal sebum synthesis and low stratum corneum hydration detected across all zones. Ceramic-rich emollients are recommended.";
      }
    }
    // 4. True Oily
    else if (oilinessScore > 65 && hydrationScore >= 45) {
      measuredType = "OILY";
      if (normalizedReported !== "OILY") {
        discrepancy = true;
        explanation =
          "Elevated sebum excretion detected in both T-zone and U-zone with adequate hydration. Niacinamide and zinc PCA will regulate lipid secretion.";
      }
    }
    // 5. Combination (T-zone oily, cheeks normal/dry)
    else {
      measuredType = "COMBINATION";
      if (normalizedReported !== "COMBINATION") {
        discrepancy = true;
        explanation =
          "Zone-specific variation detected: elevated specular reflection in T-zone with balanced lateral cheek hydration.";
      }
    }

    // Seasonal drift evaluation across previous scans
    let seasonalDrift: MeasuredSkinProfile["seasonalDrift"] = undefined;
    if (previousScansHistory && previousScansHistory.length >= 2) {
      const older = previousScansHistory[0];
      if (older && older.measuredType !== measuredType) {
        seasonalDrift = {
          previousType: older.measuredType,
          shiftReason: `Skin biophysics transitioned from ${older.measuredType} to ${measuredType}, consistent with ambient seasonal humidity shifts.`,
        };
      }
    }

    return {
      oiliness: oilinessScore,
      hydration: hydrationScore,
      sensitivity: sensitivityScore,
      measuredType,
      selfReportedType: normalizedReported,
      discrepancy,
      explanation,
      seasonalDrift,
    };
  }
}
