import {
  QuestionnaireSchema,
  ScanResultSchema,
  CreateScanRequestSchema,
  RoutineSchema,
  ProductFilterSchema,
} from "@skinsense/types";

describe("Phase 1 Zod Schemas Validation", () => {
  describe("QuestionnaireSchema", () => {
    it("should accept valid questionnaire data", () => {
      const valid = {
        skinType: "COMBINATION",
        concerns: ["ACNE", "REDNESS"],
        allergies: ["Fragrance"],
        ageRange: "TWENTIES",
        isPregnant: false,
      };

      const result = QuestionnaireSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should reject invalid skin type", () => {
      const invalid = {
        skinType: "EXTREMELY_OILY",
        concerns: ["ACNE"],
        allergies: [],
        ageRange: "TWENTIES",
        isPregnant: false,
      };

      const result = QuestionnaireSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should reject more than 3 concerns", () => {
      const invalid = {
        skinType: "DRY",
        concerns: ["ACNE", "REDNESS", "PIGMENTATION", "DRYNESS"],
        allergies: [],
        ageRange: "THIRTIES",
        isPregnant: false,
      };

      const result = QuestionnaireSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should reject empty concerns array (min 1 concern required)", () => {
      const invalid = {
        skinType: "DRY",
        concerns: [],
        allergies: [],
        ageRange: "THIRTIES",
        isPregnant: false,
      };

      const result = QuestionnaireSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("ScanResultSchema", () => {
    it("should validate complete scan result object", () => {
      const valid = {
        skinHealthScore: 82,
        zoneScores: {
          forehead: { acne: 20, redness: 10, pigmentation: 5, texture: 15, dryness: 10, oiliness: 30 },
          left_cheek: { acne: 15, redness: 25, pigmentation: 10, texture: 10, dryness: 20, oiliness: 15 },
        },
        findings: [
          {
            id: "f1",
            type: "papule",
            zone: "forehead",
            severity: 45,
            confidence: 0.9,
          },
        ],
        metadata: {
          modelVersion: "v1.0",
          processingTimeMs: 450,
        },
      };

      const result = ScanResultSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });

  describe("CreateScanRequestSchema", () => {
    it("should validate create scan request payload", () => {
      const valid = {
        imageKey: "scans/user123/scan.jpg",
        questionnaire: {
          skinType: "NORMAL",
          concerns: ["TEXTURE"],
          allergies: [],
          ageRange: "FORTIES",
          isPregnant: false,
        },
      };

      const result = CreateScanRequestSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });

  describe("ProductFilterSchema", () => {
    it("should parse and coerce query params", () => {
      const valid = {
        skinType: "OILY",
        priceTier: "BUDGET",
        limit: "15",
        offset: "30",
      };

      const result = ProductFilterSchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(15);
        expect(result.data.offset).toBe(30);
      }
    });
  });
});
