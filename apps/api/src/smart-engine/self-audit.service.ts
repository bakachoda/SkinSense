import { Injectable } from "@nestjs/common";
import type {
  SelfAuditResult,
  AuditIssue,
  ZoneScore,
} from "@skinsense/types";

@Injectable()
export class SelfAuditService {
  /**
   * Run automated sanity checks, score jump audits, and cross-signal consistency (Phase 4, Section 12)
   */
  auditResult(
    currentZoneScores: Record<string, ZoneScore>,
    currentOilinessMap?: Record<string, number>,
    previousZoneScores?: Record<string, ZoneScore>,
  ): SelfAuditResult {
    const issues: AuditIssue[] = [];

    // 1. Score Jump Audit (> 40 delta between sequential scans indicates artifact or lighting jump)
    if (previousZoneScores) {
      for (const [zone, scores] of Object.entries(currentZoneScores)) {
        const prev = previousZoneScores[zone];
        if (!prev) continue;

        for (const [concern, val] of Object.entries(scores)) {
          const prevVal = (prev as any)[concern];
          if (typeof val === "number" && typeof prevVal === "number") {
            const delta = Math.abs(val - prevVal);
            if (delta > 40) {
              issues.push({
                type: "SCORE_JUMP",
                zone,
                concern,
                delta,
                note: `Unusually sharp shift (+/- ${delta} points) in ${zone} ${concern} between sequential scans.`,
                action: "Review capture environmental illumination quality and face angle stability.",
              });
            }
          }
        }
      }
    }

    // 2. Cross-Signal Consistency Audit
    // e.g. High acne severity in sebaceous zone but near-zero oiliness indicates contradictory signals
    if (currentOilinessMap) {
      const noseAcne = currentZoneScores["nose"]?.acne || 0;
      const noseOil = currentOilinessMap["nose"] || 0;
      if (noseAcne > 70 && noseOil < 15) {
        issues.push({
          type: "CROSS_SIGNAL",
          zone: "nose",
          note: "High inflammatory acne detection accompanied by negligible specular sebum reflectance.",
          action: "Possible topical matte product artifact or false-positive papule boundary.",
        });
      }

      const foreheadOil = currentOilinessMap["forehead"] || 0;
      const foreheadDry = currentZoneScores["forehead"]?.dryness || 0;
      if (foreheadOil > 75 && foreheadDry > 65) {
        issues.push({
          type: "CROSS_SIGNAL",
          zone: "forehead",
          note: "Concurrent maximal oiliness and extreme dryness detected on forehead.",
          action: "Classified as reactive dehydrated-oily skin profile rather than standard xerosis.",
        });
      }
    }

    return {
      issues,
      confidence: issues.length === 0 ? "HIGH" : "REDUCED",
      passed: issues.length === 0 || issues.every((i) => i.type !== "SCORE_JUMP"),
    };
  }
}
