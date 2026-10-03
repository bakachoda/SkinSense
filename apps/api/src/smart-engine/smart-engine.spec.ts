import { FitzpatrickService } from "./fitzpatrick.service";
import { BarrierService } from "./barrier.service";
import { DifferentialService } from "./differential.service";
import { SafetyScreeningService } from "./safety-screening.service";
import { ReclassificationService } from "./reclassification.service";
import { EnsembleService } from "./ensemble.service";
import { ClinicalGradingService } from "./clinical-grading.service";
import { SkinAgeService } from "./skin-age.service";
import { SelfAuditService } from "./self-audit.service";
import { Finding, ZoneScore } from "@skinsense/types";

type ZoneScores = Record<string, ZoneScore>;

describe("Phase 4: Smart Engine Intelligence Stack", () => {
  describe("1. Fitzpatrick Skin Tone Adaptation & Calibration", () => {
    let service: FitzpatrickService;

    beforeEach(() => {
      service = new FitzpatrickService();
    });

    it("should classify Type I/II for very high ITA and calibrate thresholds", () => {
      // High L* (80), low b* (10) -> ITA > 55 -> Type I
      const result = service.classifyTone({ l: 80, a: 5, b: 10 });
      expect(result.category).toBe(1);
      expect(result.erythemaThresholdModifier).toBeLessThan(1.0); // Sensitive to erythema
    });

    it("should classify Type V/VI for low ITA and activate narrowband green absorption shifts", () => {
      // Low L* (35), high b* (18) -> ITA < 10 -> Type V or VI
      const result = service.classifyTone({ l: 30, a: 12, b: 15 });
      expect([5, 6]).toContain(result.category);
      expect(result.erythemaThresholdModifier).toBeGreaterThan(1.1); // Erythema presents differently
      expect(result.useNarrowbandGreen).toBe(true);
      expect(result.narrowbandGreenShift).toBeGreaterThan(0);
    });
  });

  describe("2. Barrier Health Composite & Lockout Gatekeeping", () => {
    let service: BarrierService;

    beforeEach(() => {
      service = new BarrierService();
    });

    it("should compute barrier health score and flag lockout when score < 40", () => {
      const result = service.computeBarrierHealth({
        dehydrationTexture: 85,
        oilDehydrationRatio: 80,
        sensitivityReport: 85,
        waterHardness: 80,
        productStrippingRisk: 80,
        weatherStress: 80,
        rPPGIrritation: 80,
      });

      expect(result.score).toBeLessThan(40);
      expect(result.status).toBe("COMPROMISED");
      expect(result.isLockedOut).toBe(true);
      expect(result.lockoutReason).toContain("exfoliating acids and retinoids are strictly suspended");
    });

    it("should enforce temporal hysteresis: require 2 consecutive scans >= 60 to unlock", () => {
      // First scan: compromised (< 40)
      const scan1 = service.computeBarrierHealth({
        dehydrationTexture: 85,
        oilDehydrationRatio: 80,
        sensitivityReport: 85,
        waterHardness: 80,
        productStrippingRisk: 80,
        weatherStress: 80,
        rPPGIrritation: 80,
      });
      expect(scan1.isLockedOut).toBe(true);

      // Second scan improves to 65, but previous was compromised: lockout remains because consecutiveHealthy < 2
      const scan2 = service.computeBarrierHealth(
        {
          dehydrationTexture: 20,
          oilDehydrationRatio: 20,
          sensitivityReport: 15,
          waterHardness: 10,
          productStrippingRisk: 10,
          weatherStress: 10,
        },
        [scan1.score],
      );
      // Even though current score is >= 60, hysteresis requires 2 consecutive scans >= 60
      expect(scan2.score).toBeGreaterThanOrEqual(60);
      expect(scan2.isLockedOut).toBe(true); // Still locked because only 1 scan >= 60

      // Third scan also healthy (>= 60) -> Unlocks!
      const scan3 = service.computeBarrierHealth(
        {
          dehydrationTexture: 15,
          oilDehydrationRatio: 15,
          sensitivityReport: 10,
          waterHardness: 10,
          productStrippingRisk: 10,
          weatherStress: 10,
        },
        [scan2.score, scan1.score],
      );
      expect(scan3.score).toBeGreaterThanOrEqual(60);
      expect(scan3.isLockedOut).toBe(false); // Unlocked!
    });
  });

  describe("3. Cross-Zone Spatial Differential Diagnosis", () => {
    let service: DifferentialService;

    beforeEach(() => {
      service = new DifferentialService();
    });

    it("should diagnose Hormonal Acne when acne is concentrated on chin/jawline (U-zone)", () => {
      const zoneScores: ZoneScores = {
        forehead: { acne: 10, redness: 10, pigmentation: 10, texture: 10, dryness: 10, oiliness: 20 },
        nose: { acne: 10, redness: 10, pigmentation: 10, texture: 10, dryness: 10, oiliness: 20 },
        left_cheek: { acne: 25, redness: 15, pigmentation: 10, texture: 10, dryness: 10, oiliness: 20 },
        right_cheek: { acne: 25, redness: 15, pigmentation: 10, texture: 10, dryness: 10, oiliness: 20 },
        chin: { acne: 85, redness: 60, pigmentation: 20, texture: 30, dryness: 10, oiliness: 30 },
      };

      const result = service.evaluateDifferential(zoneScores, "26-35");
      expect(result.primary.patternType).toBe("hormonal_acne");
      expect(result.primary.confidence).toBeGreaterThan(0.8);
      expect(result.spatialDistribution).toContain("HORMONAL ACNE");
    });

    it("should distinguish bilateral rosacea from unilateral phone/contact irritation", () => {
      // Unilateral irritation (only left cheek inflamed)
      const unilateralZones: ZoneScores = {
        forehead: { acne: 5, redness: 10, pigmentation: 10, texture: 10, dryness: 10, oiliness: 10 },
        nose: { acne: 5, redness: 10, pigmentation: 10, texture: 10, dryness: 10, oiliness: 10 },
        left_cheek: { acne: 10, redness: 75, pigmentation: 10, texture: 20, dryness: 20, oiliness: 10 },
        right_cheek: { acne: 5, redness: 12, pigmentation: 10, texture: 10, dryness: 10, oiliness: 10 },
        chin: { acne: 5, redness: 10, pigmentation: 10, texture: 10, dryness: 10, oiliness: 10 },
      };

      const diffUnilateral = service.evaluateDifferential(unilateralZones);
      expect(diffUnilateral.primary.patternType).toBe("external_irritation");
      expect(diffUnilateral.primary.note).toContain("asymmetry");

      // Bilateral flushing (both cheeks + nose) -> Rosacea
      const bilateralZones: ZoneScores = {
        forehead: { acne: 5, redness: 20, pigmentation: 10, texture: 10, dryness: 10, oiliness: 10 },
        nose: { acne: 5, redness: 68, pigmentation: 10, texture: 15, dryness: 10, oiliness: 10 },
        left_cheek: { acne: 5, redness: 72, pigmentation: 10, texture: 15, dryness: 10, oiliness: 10 },
        right_cheek: { acne: 5, redness: 70, pigmentation: 10, texture: 15, dryness: 10, oiliness: 10 },
        chin: { acne: 5, redness: 20, pigmentation: 10, texture: 10, dryness: 10, oiliness: 10 },
      };

      const diffBilateral = service.evaluateDifferential(bilateralZones, "36-50");
      expect(diffBilateral.primary.patternType).toBe("rosacea");
      expect(diffBilateral.primary.note).toContain("Bilateral symmetrical");
    });
  });

  describe("4. Safety Screening (ABCDE, Scars, DPN Safeguard)", () => {
    let service: SafetyScreeningService;

    beforeEach(() => {
      service = new SafetyScreeningService();
    });

    it("should flag suspicious lesions requiring clinical evaluation", () => {
      const findings: Finding[] = [
        {
          id: "lesion-1",
          type: "dark_spot",
          zone: "right_cheek",
          severity: 85,
          confidence: 0.95,
          boundingBox: { x: 0.2, y: 0.3, w: 0.15, h: 0.15 },
          description: "Asymmetrical pigmented macule with irregular borders and diameter > 6mm",
        },
      ];

      const screening = service.screenLesions(findings, [], 2);
      expect(screening.length).toBe(1);
      expect(screening[0]!.level).toBe("RECOMMEND_CHECKUP");
      expect(screening[0]!.requiresPhysicianReferral).toBe(true);
      expect(screening[0]!.clinicalMessage).toContain("board-certified dermatologist");
    });

    it("should safeguard dermatosis papulosa nigra (DPN) on dark skin (Fitzpatrick V-VI)", () => {
      const findings: Finding[] = [
        {
          id: "dpn-1",
          type: "dark_spot",
          zone: "periorbital",
          severity: 40,
          confidence: 0.88,
          boundingBox: { x: 0.2, y: 0.3, w: 0.01, h: 0.01 }, // ~2.4 mm < 3.0 mm
          description: "Small hyperpigmented smooth papule on periorbital cheek",
        },
      ];

      // On dark skin (Fitzpatrick 6), small smooth periorbital lesions are recognized as benign DPN
      const screening = service.screenLesions(findings, [], 6);
      expect(screening.length).toBe(0); // Excluded from malignant melanoma screening
    });

    it("should classify atrophic scars and route them to clinical procedures", () => {
      const findings: Finding[] = [
        {
          id: "scar-1",
          type: "texture_rough",
          zone: "left_cheek",
          severity: 80,
          confidence: 0.91,
          boundingBox: { x: 0.4, y: 0.4, w: 0.05, h: 0.05 },
          description: "Deep ice pick depression scar with sharp margins",
        },
        {
          id: "scar-2",
          type: "texture_rough",
          zone: "right_cheek",
          severity: 55,
          confidence: 0.89,
          boundingBox: { x: 0.5, y: 0.5, w: 0.04, h: 0.04 },
          description: "Rolling undulating scar",
        },
      ];

      const scars = service.classifyScars(findings);
      expect(scars.length).toBe(2);
      const icePick = scars.find((s) => s.type === "ICE_PICK");
      expect(icePick).toBeDefined();
      expect(icePick?.routing).toBe("DERMATOLOGIST_REFERRAL");
      expect(icePick?.depthMm).toBe(-1.8);

      const rolling = scars.find((s) => s.type === "ROLLING");
      expect(rolling).toBeDefined();
      expect(rolling?.routing).toBe("DERMATOLOGIST_REFERRAL");
    });
  });

  describe("5. Skin Type Reclassification (Specular Oiliness vs Hydration)", () => {
    let service: ReclassificationService;

    beforeEach(() => {
      service = new ReclassificationService();
    });

    it("should reclassify self-reported 'Oily' with high transepidermal water loss as DEHYDRATED_OILY", () => {
      const reclass = service.reclassifySkinType("DRY", 78, 30, 65);
      expect(reclass.measuredType).toBe("DEHYDRATED_OILY");
      expect(reclass.discrepancy).toBe(true);
      expect(reclass.explanation).toContain("dehydrated-oily skin");
    });
  });

  describe("6. 3-Model Ensemble Consensus", () => {
    let service: EnsembleService;

    beforeEach(() => {
      service = new EnsembleService();
    });

    it("should compute HIGH agreement when all 3 models confirm the finding", () => {
      const consensus = service.evaluateConsensus("acne", "chin", 75);
      expect(consensus.consensusConfidence).toBe("HIGH");
      expect(consensus.agreements).toBe(3);
      expect(consensus.isConfirmed).toBe(true);
    });

    it("should compute LOW agreement for low confidence edge cases", () => {
      const consensus = service.evaluateConsensus("acne", "chin", 26);
      expect(consensus.consensusConfidence).toBe("LOW");
      expect(consensus.isConfirmed).toBe(false);
    });
  });

  describe("7. Clinical Grading: GAGS & IGA", () => {
    let service: ClinicalGradingService;

    beforeEach(() => {
      service = new ClinicalGradingService();
    });

    it("should calculate Global Acne Grading System (GAGS) and IGA score", () => {
      const findings: Finding[] = [
        {
          id: "f-1",
          type: "papule",
          zone: "chin",
          severity: 70,
          confidence: 0.9,
          boundingBox: { x: 0.5, y: 0.8, w: 0.05, h: 0.05 },
          description: "Papule",
        },
        {
          id: "f-2",
          type: "pustule",
          zone: "forehead",
          severity: 75,
          confidence: 0.9,
          boundingBox: { x: 0.5, y: 0.2, w: 0.05, h: 0.05 },
          description: "Pustule",
        },
      ];

      const grading = service.computeGrading(findings);
      expect(grading.gagsScore).toBeGreaterThan(0);
      expect(grading.gagsSeverity).toBeDefined();
      expect(grading.igaScore).toBeGreaterThanOrEqual(1);
    });
  });

  describe("8. Skin Age Estimation", () => {
    let service: SkinAgeService;

    beforeEach(() => {
      service = new SkinAgeService();
    });

    it("should calculate skin age delta with zone breakdown", () => {
      const zoneScores: ZoneScores = {
        forehead: { acne: 10, redness: 10, pigmentation: 20, texture: 65, dryness: 50, oiliness: 20 },
        nose: { acne: 10, redness: 10, pigmentation: 10, texture: 20, dryness: 20, oiliness: 20 },
        left_cheek: { acne: 10, redness: 10, pigmentation: 30, texture: 40, dryness: 30, oiliness: 20 },
        right_cheek: { acne: 10, redness: 10, pigmentation: 30, texture: 40, dryness: 30, oiliness: 20 },
        chin: { acne: 10, redness: 10, pigmentation: 10, texture: 20, dryness: 20, oiliness: 20 },
      };

      const result = service.computeSkinAge(zoneScores, 25, 3);
      expect(result.chronologicalAge).toBe(25);
      expect(result.biologicalAge).toBeGreaterThan(0);
      expect(result.zoneAges["forehead"]).toBeDefined();
    });
  });

  describe("9. Self-Audit Jump & Cross-Signal Detection", () => {
    let service: SelfAuditService;

    beforeEach(() => {
      service = new SelfAuditService();
    });

    it("should flag anomalous score jump > 40 points from previous scan", () => {
      const currentZoneScores: ZoneScores = {
        forehead: { acne: 10, redness: 10, pigmentation: 10, texture: 10, dryness: 10, oiliness: 10 },
        nose: { acne: 10, redness: 10, pigmentation: 10, texture: 10, dryness: 10, oiliness: 10 },
        left_cheek: { acne: 10, redness: 10, pigmentation: 10, texture: 10, dryness: 10, oiliness: 10 },
        right_cheek: { acne: 10, redness: 10, pigmentation: 10, texture: 10, dryness: 10, oiliness: 10 },
        chin: { acne: 10, redness: 10, pigmentation: 10, texture: 10, dryness: 10, oiliness: 10 },
      };

      const previousZoneScores: ZoneScores = {
        forehead: { acne: 85, redness: 10, pigmentation: 10, texture: 10, dryness: 10, oiliness: 10 },
        nose: { acne: 10, redness: 10, pigmentation: 10, texture: 10, dryness: 10, oiliness: 10 },
        left_cheek: { acne: 10, redness: 10, pigmentation: 10, texture: 10, dryness: 10, oiliness: 10 },
        right_cheek: { acne: 10, redness: 10, pigmentation: 10, texture: 10, dryness: 10, oiliness: 10 },
        chin: { acne: 10, redness: 10, pigmentation: 10, texture: 10, dryness: 10, oiliness: 10 },
      };

      const audit = service.auditResult(currentZoneScores, { forehead: 10, nose: 10, cheeks: 10 }, previousZoneScores);
      expect(audit.passed).toBe(false);
      expect(audit.issues.length).toBeGreaterThan(0);
      expect(audit.issues.some((a) => a.type === "SCORE_JUMP")).toBe(true);
    });
  });
});
