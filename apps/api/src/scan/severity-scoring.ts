import type { ZoneScore } from "@skinsense/types";

export const CONCERN_WEIGHTS: Record<string, number> = {
  acne: 0.25,
  redness: 0.20,
  pigmentation: 0.20,
  texture: 0.15,
  dryness: 0.10,
  oiliness: 0.10,
};

export function computeSkinHealthScore(
  zoneScores: Record<string, ZoneScore | Record<string, number>> = {},
): number {
  const zones = Object.values(zoneScores).filter(Boolean);
  if (zones.length === 0) {
    return 100;
  }

  let weightedSeveritySum = 0;
  let totalWeights = 0;

  for (const [concern, weight] of Object.entries(CONCERN_WEIGHTS)) {
    let concernTotal = 0;
    let validZones = 0;

    for (const zone of zones) {
      const val = (zone as Record<string, number>)[concern];
      if (typeof val === "number" && !isNaN(val)) {
        concernTotal += Math.max(0, Math.min(100, val));
        validZones++;
      }
    }

    const avg = validZones > 0 ? concernTotal / validZones : 0;
    weightedSeveritySum += avg * weight;
    totalWeights += weight;
  }

  const normalizedSeverity = totalWeights > 0 ? weightedSeveritySum / totalWeights : 0;
  const score = Math.round(100 - normalizedSeverity);
  return Math.max(0, Math.min(100, score));
}
