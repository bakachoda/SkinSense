import { computeSkinHealthScore } from "./severity-scoring";

describe("Severity Scoring & Skin Health Score", () => {
  it("should return 100 for empty or clean zone scores", () => {
    expect(computeSkinHealthScore({})).toBe(100);
    expect(
      computeSkinHealthScore({
        forehead: { acne: 0, redness: 0, pigmentation: 0, texture: 0, dryness: 0, oiliness: 0 },
        cheeks: { acne: 0, redness: 0, pigmentation: 0, texture: 0, dryness: 0, oiliness: 0 },
      }),
    ).toBe(100);
  });

  it("should return near 0 for maximum severity across all concerns and zones", () => {
    const maxSeverity = {
      forehead: { acne: 100, redness: 100, pigmentation: 100, texture: 100, dryness: 100, oiliness: 100 },
      cheeks: { acne: 100, redness: 100, pigmentation: 100, texture: 100, dryness: 100, oiliness: 100 },
      chin: { acne: 100, redness: 100, pigmentation: 100, texture: 100, dryness: 100, oiliness: 100 },
    };

    const score = computeSkinHealthScore(maxSeverity);
    expect(score).toBe(0);
  });

  it("should calculate correct weighted composite score", () => {
    // 50 across all concerns should yield 100 - 50 = 50
    const halfSeverity = {
      zone1: { acne: 50, redness: 50, pigmentation: 50, texture: 50, dryness: 50, oiliness: 50 },
    };
    expect(computeSkinHealthScore(halfSeverity)).toBe(50);

    // Acne only (weight 0.25) at 40 severity:
    // Weighted severity = 40 * 0.25 = 10 -> Score should be 90
    const acneOnly = {
      zone1: { acne: 40, redness: 0, pigmentation: 0, texture: 0, dryness: 0, oiliness: 0 },
    };
    expect(computeSkinHealthScore(acneOnly)).toBe(90);
  });

  it("should always clamp output between 0 and 100", () => {
    const weirdScores = {
      zone1: { acne: 150, redness: -20, pigmentation: 80, texture: 0, dryness: 0, oiliness: 0 },
    };
    const score = computeSkinHealthScore(weirdScores);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});
