import { Injectable } from "@nestjs/common";
import type { SkinAgeResult, FitzpatrickType, ZoneScore } from "@skinsense/types";

@Injectable()
export class SkinAgeService {
  /**
   * Compute biological skin age and delta vs chronological age (Phase 4, Section 9)
   */
  computeSkinAge(
    zoneScores: Record<string, ZoneScore>,
    chronologicalAge: number = 25,
    fitzpatrick: FitzpatrickType = 3,
  ): SkinAgeResult {
    // 1. Extract biological age factors
    const periorbital = zoneScores["periorbital"] || { texture: 20, pigmentation: 20 };
    const forehead = zoneScores["forehead"] || { texture: 20, pigmentation: 20 };
    const leftCheek = zoneScores["left_cheek"] || { texture: 20, pigmentation: 20 };
    const rightCheek = zoneScores["right_cheek"] || { texture: 20, pigmentation: 20 };

    const fineLinesScore = periorbital.texture * 0.6 + forehead.texture * 0.4;
    const poreScore = (zoneScores["nose"]?.texture || 20) * 0.5 + (zoneScores["chin"]?.texture || 20) * 0.5;
    const pigmentationVariance = (periorbital.pigmentation + leftCheek.pigmentation + rightCheek.pigmentation) / 3;
    const textureRoughness = (forehead.texture + leftCheek.texture + rightCheek.texture) / 3;

    // 2. Fitzpatrick photoprotection coefficient
    // Deeper melanin offers inherent UV protection, adjusting expected chronological baseline
    const melaninProtectionOffset = fitzpatrick >= 4 ? -1.5 : 0;

    // 3. Normalized biological age model
    // Weighted aging index where 50 is baseline for 30yo
    const agingIndex =
      fineLinesScore * 0.35 +
      poreScore * 0.20 +
      pigmentationVariance * 0.25 +
      textureRoughness * 0.20;

    // Map aging index deviation to chronological age delta
    const rawDelta = (agingIndex - 40) * 0.22 + melaninProtectionOffset;
    const clampedDelta = Math.max(-6, Math.min(8, Math.round(rawDelta)));
    const biologicalAge = Math.max(18, chronologicalAge + clampedDelta);

    // Zone-specific biological age estimation
    const zoneAges: Record<string, number> = {
      periorbital: Math.round(chronologicalAge + (periorbital.texture - 35) * 0.25),
      forehead: Math.round(chronologicalAge + (forehead.texture - 35) * 0.2),
      cheeks: Math.round(chronologicalAge + ((leftCheek.pigmentation + rightCheek.pigmentation) / 2 - 35) * 0.2),
      chin: Math.round(chronologicalAge + ((zoneScores["chin"]?.texture || 20) - 35) * 0.15),
    };

    const primaryContributingFactors: SkinAgeResult["primaryContributingFactors"] = [];
    if (fineLinesScore > 40) {
      primaryContributingFactors.push({
        factor: "fineLines",
        impact: "Early dynamic expression lines noted in periorbital zone.",
      });
    }
    if (poreScore > 45) {
      primaryContributingFactors.push({
        factor: "poreVisibility",
        impact: "Pore dilation concentrated in central T-zone.",
      });
    }
    if (pigmentationVariance > 40) {
      primaryContributingFactors.push({
        factor: "pigmentationIrregularity",
        impact: "Malar sun accumulation contributing to tonal variance.",
      });
    }
    if (textureRoughness > 40) {
      primaryContributingFactors.push({
        factor: "textureRoughness",
        impact: "Epidermal turnover slowdown causing micro-relief roughness.",
      });
    }

    return {
      biologicalAge,
      chronologicalAge,
      delta: biologicalAge - chronologicalAge,
      zoneAges,
      primaryContributingFactors,
    };
  }
}
