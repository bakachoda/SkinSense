import type {
  Finding,
  CalibratedFinding,
  UserSelection,
  SpotMarker,
  FindingSource,
  CalibratedConfidence,
} from "@skinsense/types";

/**
 * 9.4 Cross-Referencing Logic (Phase 3, Section 9.4)
 * Evaluates AI findings against user self-assessment selections and touch-to-mark coordinates.
 *
 * Rules:
 * 1. User selected & AI confidence > 0.5 -> HIGH confidence (verified by both AI and user)
 * 2. User did NOT select & AI confidence > 0.7 -> MODERATE confidence ("We also noticed...")
 * 3. User selected & AI confidence <= 0.5 -> LOW confidence (user marked, marked for re-analysis)
 * 4. User spot markers not matched with AI -> Added as user_only low confidence item with reanalyze=true
 */
export function crossReferenceFindings(
  aiFindings: Finding[],
  userSelections: UserSelection[] = [],
  spotMarkers: SpotMarker[] = [],
): CalibratedFinding[] {
  const result: CalibratedFinding[] = [];
  const processedZones = new Set<string>();

  for (const finding of aiFindings) {
    const userSelected = userSelections.some((s) => {
      if (s.zone !== finding.zone) return false;
      return s.concerns.some((c) =>
        concernMatchesFindingType(c.toLowerCase(), finding.type.toLowerCase()),
      );
    });

    const hasSpotInZone = spotMarkers.some((sm) => sm.zone === finding.zone);
    const userConfirmed = userSelected || hasSpotInZone;

    if (userConfirmed && finding.confidence > 0.5) {
      result.push({
        ...finding,
        calibratedConfidence: "HIGH" as CalibratedConfidence,
        source: "ai_and_user" as FindingSource,
        label: "Verified by both AI & your assessment",
      });
      processedZones.add(finding.zone);
    } else if (!userConfirmed && finding.confidence > 0.7) {
      result.push({
        ...finding,
        calibratedConfidence: "MODERATE" as CalibratedConfidence,
        source: "ai_only" as FindingSource,
        label: "We also noticed...",
      });
    } else if (userConfirmed && finding.confidence <= 0.5) {
      result.push({
        ...finding,
        calibratedConfidence: "LOW" as CalibratedConfidence,
        source: "user_only" as FindingSource,
        label: "Marked by you (queued for deep re-analysis)",
        reanalyze: true,
      });
      processedZones.add(finding.zone);
    } else {
      // Default retention if confidence is decent
      result.push({
        ...finding,
        calibratedConfidence: "MODERATE" as CalibratedConfidence,
        source: "ai_only" as FindingSource,
      });
    }
  }

  // Include user spot markers that were not picked up by AI
  for (const marker of spotMarkers) {
    const alreadyPresent = result.some(
      (r) =>
        r.zone === marker.zone &&
        r.boundingBox &&
        Math.abs(r.boundingBox.x - marker.x) < 0.15 &&
        Math.abs(r.boundingBox.y - marker.y) < 0.15,
    );

    if (!alreadyPresent) {
      result.push({
        id: marker.id || `spot-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        type: "papule", // default skin concern category
        zone: marker.zone,
        severity: 45,
        confidence: 0.5,
        boundingBox: {
          x: Math.max(0, marker.x - 0.04),
          y: Math.max(0, marker.y - 0.04),
          w: 0.08,
          h: 0.08,
        },
        description: marker.userNote || `User marked concern on ${marker.zone}`,
        calibratedConfidence: "LOW" as CalibratedConfidence,
        source: "user_only" as FindingSource,
        label: "User marked area",
        reanalyze: true,
      });
    }
  }

  return result;
}

function concernMatchesFindingType(concern: string, findingType: string): boolean {
  if (concern === findingType) return true;
  if (concern.includes("acne") && (findingType === "papule" || findingType === "pustule" || findingType === "comedone")) return true;
  if (concern.includes("blackhead") && findingType === "comedone") return true;
  if (concern.includes("redness") && findingType === "redness_patch") return true;
  if (concern.includes("spot") && findingType === "dark_spot") return true;
  if (concern.includes("dry") && findingType === "dryness_patch") return true;
  if (concern.includes("texture") && findingType === "texture_rough") return true;
  return false;
}
