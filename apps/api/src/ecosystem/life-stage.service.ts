import { Injectable } from "@nestjs/common";
import {
  LifeStage,
  PREGNANCY_SAFE,
  PREGNANCY_BANNED,
  MEDICATION_SIDE_EFFECTS,
  SideEffect,
} from "@skinsense/types";

export interface PregnancyAuditResult {
  isSafe: boolean;
  bannedIngredientsDetected: string[];
  safeAlternativesRecommended: string[];
  melasmaPatternDetected: boolean;
  guidanceMessage: string;
}

export interface LifeStageAdaptation {
  lifeStage: LifeStage;
  primaryRecommendations: string[];
  routineTierLimit: "ESSENTIAL" | "STANDARD" | "COMPREHENSIVE";
  keyIngredientsPrioritized: string[];
  restrictedIngredients: string[];
}

@Injectable()
export class LifeStageService {
  /**
   * Audits product ingredients for pregnancy and nursing safety.
   */
  auditPregnancySafety(ingredients: string[], facialZoneScores?: Record<string, Record<string, number>>): PregnancyAuditResult {
    const bannedDetected: string[] = [];

    for (const ing of ingredients) {
      const ingLower = ing.toLowerCase();
      for (const banned of PREGNANCY_BANNED) {
        if (ingLower.includes(banned.toLowerCase()) && !bannedDetected.includes(banned)) {
          bannedDetected.push(banned);
        }
      }
    }

    // Melasma pattern: bilateral cheek + forehead pigmentation
    let melasmaPatternDetected = false;
    if (facialZoneScores) {
      const leftCheekPigment = facialZoneScores["left_cheek"]?.["pigmentation"] || 0;
      const rightCheekPigment = facialZoneScores["right_cheek"]?.["pigmentation"] || 0;
      const foreheadPigment = facialZoneScores["forehead"]?.["pigmentation"] || 0;

      // Symmetrical bilateral pigmentation
      if (leftCheekPigment > 35 && rightCheekPigment > 35 && Math.abs(leftCheekPigment - rightCheekPigment) < 15) {
        melasmaPatternDetected = true;
      }
    }

    const safeAlternativesRecommended = PREGNANCY_SAFE.slice(0, 5);

    let guidanceMessage = "All selected ingredients are aligned with obstetric safety standards.";
    if (bannedDetected.length > 0) {
      guidanceMessage = `Warning: ${bannedDetected.join(", ")} detected. High-potency retinoids, salicylic acid (>2%), and chemical sunscreens are contraindicated during pregnancy. Replace with azelaic acid and mineral SPF.`;
    }

    return {
      isSafe: bannedDetected.length === 0,
      bannedIngredientsDetected: bannedDetected,
      safeAlternativesRecommended,
      melasmaPatternDetected,
      guidanceMessage,
    };
  }

  /**
   * Adapts routine configuration for user's biological life-stage.
   */
  getLifeStageAdaptation(lifeStage: LifeStage, age?: number): LifeStageAdaptation {
    switch (lifeStage) {
      case "PREGNANCY":
        return {
          lifeStage: "PREGNANCY",
          primaryRecommendations: [
            "Mineral-only broad-spectrum SPF 50 (Zinc Oxide / Titanium Dioxide)",
            "Azelaic acid 10% for hormonal breakouts and pregnancy melasma",
            "Niacinamide and hyaluronic acid for barrier moisture lock",
          ],
          routineTierLimit: "STANDARD",
          keyIngredientsPrioritized: ["Azelaic Acid", "Centella Asiatica", "Zinc Oxide", "Hyaluronic Acid"],
          restrictedIngredients: PREGNANCY_BANNED,
        };

      case "POSTPARTUM":
        return {
          lifeStage: "POSTPARTUM",
          primaryRecommendations: [
            "Gradual re-introduction of active brighteners (Vitamin C, gentle AHA)",
            "Barrier restoration while hormonal estrogen swings normalize",
          ],
          routineTierLimit: "STANDARD",
          keyIngredientsPrioritized: ["Vitamin C", "Ceramides", "Niacinamide"],
          restrictedIngredients: ["Tretinoin (if nursing)"],
        };

      case "PERIMENOPAUSE":
        return {
          lifeStage: "PERIMENOPAUSE",
          primaryRecommendations: [
            "Heavy ceramide lipid replenishment to counteract estrogen-related sebum drop",
            "Collagen-stimulating signal peptides (Matrixyl / Copper Peptides)",
            "Gentle encapsulated retinoids buffered with squalane",
          ],
          routineTierLimit: "COMPREHENSIVE",
          keyIngredientsPrioritized: ["Ceramides", "Peptides", "Squalane", "Retinol"],
          restrictedIngredients: ["Harsh foaming sulfate cleansers", "Alcohol-heavy toners"],
        };

      case "PUBERTY":
        return {
          lifeStage: "PUBERTY",
          primaryRecommendations: [
            "Simplified 3-step routine (Gentle Cleanser, Light Gel Moisturizer, SPF)",
            "Low-concentration salicylic acid (0.5% - 1%) for follicular pore clearing",
            "Avoid aggressive multi-acid layering to prevent chronic barrier destruction",
          ],
          routineTierLimit: "ESSENTIAL",
          keyIngredientsPrioritized: ["Salicylic Acid (gentle)", "Zinc PCA", "Niacinamide"],
          restrictedIngredients: ["High strength retinol (>0.5%)", "Glycolic peels (>7%)"],
        };

      default:
        return {
          lifeStage: "NONE",
          primaryRecommendations: ["Maintain daily broad-spectrum SPF and barrier hydration."],
          routineTierLimit: "STANDARD",
          keyIngredientsPrioritized: ["Niacinamide", "Hyaluronic Acid", "SPF"],
          restrictedIngredients: [],
        };
    }
  }

  /**
   * Attributes cutaneous findings to documented medication side effects.
   */
  attributeMedicationSideEffects(activeMedications: string[]): Array<{
    medication: string;
    finding: string;
    confidence: "LOW" | "MEDIUM" | "HIGH";
    message: string;
  }> {
    const results: Array<{
      medication: string;
      finding: string;
      confidence: "LOW" | "MEDIUM" | "HIGH";
      message: string;
    }> = [];

    for (const med of activeMedications) {
      const medLower = med.toLowerCase();
      for (const [key, sideEffects] of Object.entries(MEDICATION_SIDE_EFFECTS)) {
        if (medLower.includes(key)) {
          for (const se of sideEffects) {
            results.push({
              medication: med,
              finding: se.finding,
              confidence: se.confidence,
              message: se.message,
            });
          }
        }
      }
    }

    return results;
  }
}
