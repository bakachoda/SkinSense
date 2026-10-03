import { Injectable } from "@nestjs/common";
import type {
  DifferentialDiagnosisResult,
  RankedDifferential,
  ZoneScore,
} from "@skinsense/types";

@Injectable()
export class DifferentialService {
  /**
   * Analyze spatial distribution of lesions across facial zones to produce a clinical
   * ranked differential diagnosis list (Phase 4, Section 4)
   */
  evaluateDifferential(
    zoneScores: Record<string, ZoneScore>,
    userAgeRange?: string,
  ): DifferentialDiagnosisResult {
    const forehead = zoneScores["forehead"] || { acne: 0, redness: 0 };
    const nose = zoneScores["nose"] || { acne: 0, redness: 0 };
    const leftCheek = zoneScores["left_cheek"] || { acne: 0, redness: 0 };
    const rightCheek = zoneScores["right_cheek"] || { acne: 0, redness: 0 };
    const chin = zoneScores["chin"] || { acne: 0, redness: 0 };

    const differentials: RankedDifferential[] = [];

    // 1. Sebaceous / Comedonal Acne (T-zone predominant)
    if (forehead.acne > 35 && nose.acne > 30) {
      differentials.push({
        condition: "Sebaceous Comedonal Acne",
        patternType: "sebaceous_acne",
        confidence: 0.88,
        treatment: "Salicylic acid 2% (BHA), niacinamide 5-10%, non-comedogenic hydration",
        note: "Predominance in the sebum-dense T-zone indicates hyperkeratinization driven by sebaceous output.",
      });
    }

    // 2. Hormonal Acne (U-zone / jawline / chin predominant)
    if (chin.acne > 45 && leftCheek.acne < 35 && rightCheek.acne < 35) {
      differentials.push({
        condition: "Hormonal Mandibular Acne",
        patternType: "hormonal_acne",
        confidence: 0.84,
        treatment: "Azelaic acid 10%, topical retinoids; correlate with cycle timing",
        note: "U-zone concentration strongly correlates with androgen-mediated sebaceous sensitivity. If refractory, consult dermatologist for spironolactone/oral evaluation.",
      });
    }

    // 3. Rosacea (Symmetrical bilateral cheek redness)
    const cheekRednessDiff = Math.abs(leftCheek.redness - rightCheek.redness);
    if (cheekRednessDiff <= 15 && leftCheek.redness > 35 && rightCheek.redness > 35) {
      differentials.push({
        condition: "Erythematotelangiectatic Rosacea",
        patternType: "rosacea",
        confidence: 0.82,
        treatment: "Azelaic acid 10%, centella asiatica, trigger avoidance (heat/spicy/alcohol), SPF 50+",
        note: "Bilateral symmetrical malar flush is a hallmark of microvascular hyper-reactivity.",
      });
    }

    // 4. External Contact Irritation (Asymmetric cheek redness)
    if (cheekRednessDiff > 22 && (leftCheek.redness > 35 || rightCheek.redness > 35)) {
      const worseSide = leftCheek.redness > rightCheek.redness ? "left" : "right";
      differentials.push({
        condition: "Unilateral Contact / Friction Irritation",
        patternType: "external_irritation",
        confidence: 0.79,
        treatment: "Barrier repair with ceramides, sanitize cell phone glass, switch to silk pillowcase",
        note: `Marked asymmetry (${worseSide} cheek significantly more erythematous) points to an external mechanical trigger rather than systemic dermatosis.`,
        followUpQuestion: `Do you sleep predominantly on your ${worseSide} side or hold your mobile phone to that ear?`,
      });
    }

    // 5. Fungal Folliculitis (Malassezia)
    if (forehead.acne > 48 && chin.acne < 20 && leftCheek.acne < 20 && rightCheek.acne < 20) {
      differentials.push({
        condition: "Pityrosporum / Malassezia Folliculitis",
        patternType: "fungal_folliculitis",
        confidence: 0.74,
        treatment: "Ketoconazole / zinc pyrithione wash, avoid fungal acne triggers (fatty acids/oils)",
        note: "Monomorphic forehead-isolated papules that fail standard antibacterial acne therapy warrant a fungal folliculitis evaluation (KOH prep by dermatologist).",
      });
    }

    // 6. Perioral Dermatitis
    if (chin.redness > 45 && forehead.redness < 20 && (nose.redness < 30 || nose.redness === undefined)) {
      differentials.push({
        condition: "Perioral Dermatitis",
        patternType: "perioral_dermatitis",
        confidence: 0.72,
        treatment: "Zero therapy (pause all harsh actives), avoid topical corticosteroids, gentle barrier cream",
        note: "Perioral distribution sparing vermilion border. Avoid fluorinated toothpaste and heavy occlusives.",
      });
    }

    // Fallback if no specific spatial pattern dominated
    if (differentials.length === 0) {
      differentials.push({
        condition: "Generalized Mild Epidermal Congestion",
        patternType: "other",
        confidence: 0.70,
        treatment: "Gentle daily cleanser, balanced ceramide moisturizer, broad-spectrum sunscreen",
        note: "Mild dispersed findings across facial zones with no localized clinical clustering.",
      });
    }

    // Sort by confidence
    differentials.sort((a, b) => b.confidence - a.confidence);

    const primary = differentials[0]!;
    const alternatives = differentials.slice(1);

    return {
      primary,
      alternatives,
      spatialDistribution: `${primary.patternType.replace("_", " ").toUpperCase()}: ${primary.note}`,
    };
  }
}
