import { Injectable } from "@nestjs/common";
import type { Finding, ClinicalGradingResult } from "@skinsense/types";

const GAGS_LOCATION_FACTORS: Record<string, number> = {
  forehead: 2,
  left_cheek: 2,
  right_cheek: 2,
  nose: 1,
  chin: 1,
};

const GAGS_LESION_SCORES: Record<string, number> = {
  comedone: 1,
  papule: 2,
  pustule: 3,
  nodule: 4,
};

@Injectable()
export class ClinicalGradingService {
  /**
   * Compute standardized clinical acne grading (GAGS and IGA) (Phase 4, Section 11)
   */
  computeGrading(findings: Finding[]): ClinicalGradingResult {
    let gagsScore = 0;

    for (const [zone, factor] of Object.entries(GAGS_LOCATION_FACTORS)) {
      const zoneFindings = findings.filter(
        (f) => (f.zone === zone || (zone === "cheeks" && (f.zone === "left_cheek" || f.zone === "right_cheek"))) &&
          GAGS_LESION_SCORES[f.type] !== undefined,
      );

      if (zoneFindings.length > 0) {
        const worstScore = Math.max(...zoneFindings.map((f) => GAGS_LESION_SCORES[f.type] || 0));
        gagsScore += factor * worstScore;
      }
    }

    // Default baseline if no active inflammatory lesions
    if (gagsScore === 0) {
      gagsScore = findings.length > 0 ? 3 : 0;
    }

    let gagsSeverity: ClinicalGradingResult["gagsSeverity"];
    if (gagsScore <= 18) {
      gagsSeverity = "Mild";
    } else if (gagsScore <= 30) {
      gagsSeverity = "Moderate";
    } else if (gagsScore <= 38) {
      gagsSeverity = "Severe";
    } else {
      gagsSeverity = "Very Severe";
    }

    // Map to Investigator's Global Assessment (IGA 0-4)
    let igaScore = 0;
    let igaLabel = "Clear";

    if (gagsScore === 0) {
      igaScore = 0;
      igaLabel = "Clear (No inflammatory lesions)";
    } else if (gagsScore <= 10) {
      igaScore = 1;
      igaLabel = "Almost Clear (Rare non-inflammatory comedones)";
    } else if (gagsScore <= 18) {
      igaScore = 2;
      igaLabel = "Mild (Few papules/comedones)";
    } else if (gagsScore <= 30) {
      igaScore = 3;
      igaLabel = "Moderate (Many comedones/papules, few pustules)";
    } else {
      igaScore = 4;
      igaLabel = "Severe (Extensive inflammatory papulopustular involvement)";
    }

    return {
      gagsScore,
      gagsSeverity,
      igaScore,
      igaLabel,
    };
  }
}
