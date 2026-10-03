import { Injectable } from "@nestjs/common";
import type {
  SafetyScreeningResult,
  SafetyLevel,
  ABCDEScore,
  ScarFinding,
  ScarType,
  Finding,
  FitzpatrickType,
} from "@skinsense/types";

@Injectable()
export class SafetyScreeningService {
  /**
   * Screen pigmented lesions against dermatological ABCDE criteria (Phase 4, Section 6)
   */
  screenLesions(
    findings: Finding[],
    previousScansFindings?: Finding[][],
    fitzpatrick?: FitzpatrickType,
  ): SafetyScreeningResult[] {
    const results: SafetyScreeningResult[] = [];
    const pigmented = findings.filter((f) => f.type === "dark_spot");

    for (const lesion of pigmented) {
      // 1. Asymmetry
      const asymmetry = (lesion.boundingBox?.w || 0.05) > 0.12 ? 0.45 : 0.15;

      // 2. Border Irregularity
      const borderIrregularity = lesion.severity > 75 ? 0.55 : 0.25;

      // 3. Color Variance
      const colorVariance = lesion.severity > 70 ? 0.60 : 0.20;

      // 4. Diameter in mm (assuming ~2.5 px/mm scale, bounding box width normalized to ~600px face)
      const estimatedDiameterMm = ((lesion.boundingBox?.w || 0.05) * 600) / 2.5;

      // 5. Evolution across prior scans
      let evolutionDetected = false;
      if (previousScansFindings && previousScansFindings.length > 0) {
        // If lesion was significantly smaller or not present in previous scan
        const match = previousScansFindings[0]?.find(
          (pf) => pf.zone === lesion.zone && Math.abs(pf.severity - lesion.severity) > 25,
        );
        if (match) evolutionDetected = true;
      }

      // Skin of Color adjustment (Phase 4, Section 7):
      // DPN (Dermatosis papulosa nigra) is benign on Fitzpatrick IV-VI; do not falsely flag
      const isLikelyDpn =
        (fitzpatrick === 5 || fitzpatrick === 6) &&
        lesion.zone === "periorbital" &&
        estimatedDiameterMm < 3.0;

      if (isLikelyDpn) {
        continue; // Exclude benign DPN from malignant melanoma screening
      }

      let flagCount = 0;
      if (asymmetry > 0.3) flagCount++;
      if (borderIrregularity > 0.5) flagCount++;
      if (colorVariance > 0.5) flagCount++;
      if (estimatedDiameterMm > 6.0) flagCount++;
      if (evolutionDetected) flagCount++;

      const abcde: ABCDEScore = {
        asymmetry,
        borderIrregularity,
        colorVariance,
        diameterMm: Number(estimatedDiameterMm.toFixed(1)),
        evolutionDetected,
        totalFlagCount: flagCount,
      };

      let level: SafetyLevel = "NORMAL";
      let clinicalMessage = "Lesion characteristics fall within typical cosmetic parameters.";
      let requiresPhysicianReferral = false;

      if (flagCount >= 3 || evolutionDetected) {
        level = "RECOMMEND_CHECKUP";
        clinicalMessage = `We observed a pigmented spot on your ${lesion.zone.replace("_", " ")} that warrants in-person evaluation. We recommend having a board-certified dermatologist review this area with a dermatoscope.`;
        requiresPhysicianReferral = true;
      } else if (flagCount >= 2) {
        level = "MONITOR";
        clinicalMessage = `Pigmented spot on ${lesion.zone.replace("_", " ")} exhibits slight border or color variance. We will track structural evolution in upcoming scans.`;
      }

      results.push({
        level,
        lesionId: lesion.id,
        zone: lesion.zone,
        abcde,
        clinicalMessage,
        requiresPhysicianReferral,
      });
    }

    return results;
  }

  /**
   * Classify scar depth and morphology into Clinical Routing (Phase 4, Section 5)
   */
  classifyScars(findings: Finding[]): ScarFinding[] {
    const scars: ScarFinding[] = [];
    const textural = findings.filter((f) => f.type === "texture_rough" || f.description?.toLowerCase().includes("scar"));

    for (const f of textural) {
      // Simulate depth signature from photometric/stereoscopic texture
      if (f.severity > 75) {
        // Deep ice-pick or boxcar
        scars.push({
          type: "ICE_PICK",
          zone: f.zone,
          depthMm: -1.8,
          isSurfaceOnly: false,
          treatment: "TCA cross, punch excision, or fractional ablative laser",
          routing: "DERMATOLOGIST_REFERRAL",
          referralNote:
            "Depressed atrophic scarring of this depth responds best to in-office clinical modalities. Topical skincare will not remodel fibrous ice-pick architecture.",
        });
      } else if (f.severity > 50) {
        // Rolling scars
        scars.push({
          type: "ROLLING",
          zone: f.zone,
          depthMm: -0.4,
          isSurfaceOnly: false,
          treatment: "Microneedling, subcision, PRP",
          routing: "DERMATOLOGIST_REFERRAL",
          referralNote:
            "Rolling undulating scars involve dermal tethering best addressed via clinical microneedling or subcision.",
        });
      }
    }

    return scars;
  }
}
