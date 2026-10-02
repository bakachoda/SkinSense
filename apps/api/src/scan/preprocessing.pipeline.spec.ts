import {
  computeWhiteBalance,
  computeScaleNormalization,
  analyzeSpecularOiliness,
  computeMultiAngleCoverage,
  runPreprocessingPipeline,
} from "./preprocessing.pipeline";

describe("Phase 3 Preprocessing Pipeline", () => {
  describe("10a. White Balance Normalization", () => {
    it("should calculate correct channel gains to normalize white point", () => {
      const sample: [number, number, number] = [200, 220, 240];
      const result = computeWhiteBalance(sample);

      expect(result.gain[0]).toBeCloseTo(255 / 200, 2);
      expect(result.gain[1]).toBeCloseTo(255 / 220, 2);
      expect(result.gain[2]).toBeCloseTo(255 / 240, 2);
      expect(result.estimatedColorTempK).toBeGreaterThanOrEqual(2500);
      expect(result.estimatedColorTempK).toBeLessThanOrEqual(9000);
    });

    it("clamps gains between 0.5 and 2.0 safely", () => {
      const darkSample: [number, number, number] = [50, 50, 50];
      const result = computeWhiteBalance(darkSample);
      expect(result.gain[0]).toBe(2.0);
      expect(result.gain[1]).toBe(2.0);
      expect(result.gain[2]).toBe(2.0);
    });
  });

  describe("10f. Distance & Scale Normalization", () => {
    it("should calculate physical scale in pixels per mm using real IPD 62mm", () => {
      const ipdPx = 240;
      const imageWidth = 1080;
      const scale = computeScaleNormalization(ipdPx, imageWidth);

      expect(scale.distanceMm).toBeGreaterThan(200);
      expect(scale.distanceMm).toBeLessThan(700);
      expect(scale.pxPerMm).toBeGreaterThan(0);
      expect(scale.scaleFactorMm).toBeGreaterThan(0);
    });
  });

  describe("10d. Specular Map Oiliness Analysis", () => {
    it("computes higher oiliness for T-zone (forehead, nose) and oily skin types", () => {
      const oilyScores = analyzeSpecularOiliness(true, "OILY");
      const dryScores = analyzeSpecularOiliness(false, "DRY");

      expect(oilyScores.nose).toBeGreaterThan(oilyScores.left_cheek);
      expect(oilyScores.forehead).toBeGreaterThan(oilyScores.periorbital);
      expect(oilyScores.nose).toBeGreaterThan(dryScores.nose);
      expect(dryScores.periorbital).toBeLessThan(15);
    });
  });

  describe("10g. Multi-Angle Zone Coverage", () => {
    it("provides superior coverage across cheeks and temples for 3 poses vs single frontal", () => {
      const multi = computeMultiAngleCoverage(3);
      const single = computeMultiAngleCoverage(1);

      expect(multi.coverageMap.left_cheek).toBeGreaterThan(single.coverageMap.left_cheek);
      expect(multi.coverageMap.right_cheek).toBeGreaterThan(single.coverageMap.right_cheek);
      expect(multi.effectiveResolutionMultiplier).toBeGreaterThan(single.effectiveResolutionMultiplier);
    });
  });

  describe("End-to-End Pipeline Execution", () => {
    it("generates complete PreprocessedComposite with valid metrics", () => {
      const composite = runPreprocessingPipeline(
        {
          imageKeys: ["pose1.jpg", "pose2.jpg", "pose3.jpg"],
          captureMode: "audio_guided",
          calibrationKey: "calib.jpg",
        },
        "COMBINATION",
        true,
      );

      expect(composite.anglesProcessed).toBe(3);
      expect(composite.scaleFactorMm).toBeGreaterThan(0);
      expect(composite.oiliness.nose).toBeGreaterThan(composite.oiliness.periorbital);
      expect(composite.zoneCoverage.left_cheek).toBe(0.99);
    });
  });
});
