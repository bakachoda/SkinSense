import { generateRoutine, CatalogProduct } from "./routine.engine";
import { SkinConcern, ProductCategory, type ScanResult } from "@skinsense/types";

describe("Routine Engine", () => {
  const mockProducts: CatalogProduct[] = [
    {
      id: "cleanser-1",
      name: "Hydrating Cleanser",
      brand: "BrandA",
      category: ProductCategory.CLEANSER,
      skinTypes: ["COMBINATION", "DRY", "OILY"],
      concerns: ["DRYNESS"],
      ingredients: ["Water", "Glycerin", "Ceramides"],
      activeIngredients: [{ name: "Ceramides" }],
    },
    {
      id: "serum-vitc",
      name: "Vitamin C Serum",
      brand: "BrandB",
      category: ProductCategory.SERUM,
      skinTypes: ["COMBINATION", "OILY"],
      concerns: ["PIGMENTATION"],
      ingredients: ["Water", "Ascorbic Acid", "Ferulic Acid"],
      activeIngredients: [{ name: "Vitamin C", concentration: "15%" }],
    },
    {
      id: "serum-niacinamide",
      name: "Niacinamide 10% + Zinc 1%",
      brand: "BrandB",
      category: ProductCategory.SERUM,
      skinTypes: ["OILY", "COMBINATION"],
      concerns: ["ACNE", "OILINESS"],
      ingredients: ["Water", "Niacinamide", "Zinc PCA"],
      activeIngredients: [{ name: "Niacinamide", concentration: "10%" }],
    },
    {
      id: "treatment-retinol",
      name: "Retinol 0.5%",
      brand: "BrandC",
      category: ProductCategory.TREATMENT,
      skinTypes: ["COMBINATION", "DRY"],
      concerns: ["FINE_LINES", "TEXTURE"],
      ingredients: ["Squalane", "Retinol"],
      activeIngredients: [{ name: "Retinol", concentration: "0.5%" }],
    },
    {
      id: "treatment-glycolic",
      name: "Glycolic Acid 7%",
      brand: "BrandD",
      category: ProductCategory.TREATMENT,
      skinTypes: ["COMBINATION", "OILY"],
      concerns: ["TEXTURE"],
      ingredients: ["Water", "Glycolic Acid"],
      activeIngredients: [{ name: "Glycolic Acid", concentration: "7%" }],
    },
    {
      id: "treatment-salicylic",
      name: "Salicylic Acid 2%",
      brand: "BrandD",
      category: ProductCategory.TREATMENT,
      skinTypes: ["OILY", "COMBINATION"],
      concerns: ["ACNE"],
      ingredients: ["Water", "Salicylic Acid"],
      activeIngredients: [{ name: "Salicylic Acid", concentration: "2%" }],
    },
    {
      id: "treatment-bp",
      name: "Benzoyl Peroxide 2.5%",
      brand: "BrandE",
      category: ProductCategory.TREATMENT,
      skinTypes: ["OILY"],
      concerns: ["ACNE"],
      ingredients: ["Water", "Benzoyl Peroxide"],
      activeIngredients: [{ name: "Benzoyl Peroxide", concentration: "2.5%" }],
    },
    {
      id: "moisturizer-1",
      name: "Barrier Moisturizer",
      brand: "BrandA",
      category: ProductCategory.MOISTURIZER,
      skinTypes: ["COMBINATION", "DRY", "OILY"],
      concerns: ["DRYNESS"],
      ingredients: ["Water", "Ceramides", "Hyaluronic Acid", "Dimethicone"],
      activeIngredients: [{ name: "Ceramides" }],
    },
    {
      id: "moisturizer-fragrance",
      name: "Scented Moisturizer",
      brand: "BrandA",
      category: ProductCategory.MOISTURIZER,
      skinTypes: ["COMBINATION", "DRY"],
      concerns: ["DRYNESS"],
      ingredients: ["Water", "Fragrance", "Mineral Oil"],
      activeIngredients: [],
    },
    {
      id: "spf-1",
      name: "Daily UV Fluid SPF 50",
      brand: "BrandF",
      category: ProductCategory.SPF,
      skinTypes: ["COMBINATION", "OILY", "DRY"],
      concerns: ["DRYNESS"],
      ingredients: ["Water", "Zinc Oxide"],
      activeIngredients: [{ name: "Zinc Oxide" }],
    },
  ];

  const baseScanResult: ScanResult = {
    version: 1,
    skinHealthScore: 75,
    zoneScores: {
      forehead: { acne: 60, redness: 20, pigmentation: 10, texture: 30, dryness: 10, oiliness: 40 },
      left_cheek: { acne: 55, redness: 20, pigmentation: 15, texture: 25, dryness: 10, oiliness: 30 },
      right_cheek: { acne: 50, redness: 20, pigmentation: 15, texture: 25, dryness: 10, oiliness: 30 },
      nose: { acne: 40, redness: 10, pigmentation: 10, texture: 35, dryness: 10, oiliness: 60 },
      chin: { acne: 65, redness: 25, pigmentation: 15, texture: 30, dryness: 10, oiliness: 45 },
    },
    findings: [],
    metadata: { modelVersion: "v1.0", processingTimeMs: 100 },
  };

  it("should generate valid AM and PM steps with correct step ordering", () => {
    const routine = generateRoutine(
      baseScanResult,
      { skinType: "COMBINATION", concerns: ["ACNE", "OILINESS"], isPregnant: false },
      mockProducts,
    );

    expect(routine).toBeDefined();
    expect(routine.amSteps.length).toBeGreaterThanOrEqual(3);
    expect(routine.pmSteps.length).toBeGreaterThanOrEqual(3);

    // AM order: Cleanser -> Active -> Moisturizer -> SPF
    expect(routine.amSteps[0]?.stepType).toBe("CLEANSER");
    expect(routine.amSteps[routine.amSteps.length - 1]?.stepType).toBe("SPF");

    // PM order: Cleanser -> Active -> Moisturizer
    expect(routine.pmSteps[0]?.stepType).toBe("CLEANSER");
    expect(routine.pmSteps[routine.pmSteps.length - 1]?.stepType).toBe("MOISTURIZER");
  });

  it("should separate Retinol and Glycolic Acid into separate AM/PM routines", () => {
    const scanWithTextureAndLines: ScanResult = {
      version: 1,
      skinHealthScore: 60,
      zoneScores: {
        forehead: { acne: 10, redness: 10, pigmentation: 10, texture: 80, dryness: 10, oiliness: 10 },
      },
      findings: [],
      metadata: { modelVersion: "v1.0", processingTimeMs: 100 },
    };

    const routine = generateRoutine(
      scanWithTextureAndLines,
      { skinType: "COMBINATION", concerns: ["FINE_LINES", "TEXTURE"], isPregnant: false },
      mockProducts,
    );

    // Should record conflict and separate
    if (routine.conflicts) {
      const conflict = routine.conflicts.find(
        (c) =>
          (c.ingredientA === "Retinol" && c.ingredientB === "Glycolic Acid") ||
          (c.ingredientA === "Glycolic Acid" && c.ingredientB === "Retinol"),
      );
      expect(conflict).toBeDefined();
      expect(conflict?.resolution).toBe("SEPARATE_AM_PM");
    }

    // Verify Retinol is in PM if present
    const amHasRetinol = routine.amSteps.some((s) =>
      s.targetIngredients.some((i) => i.toLowerCase().includes("retinol")),
    );
    expect(amHasRetinol).toBe(false);
  });

  it("should never prescribe Glycolic Acid and Salicylic Acid together in same routine (NEVER_SAME_ROUTINE)", () => {
    const scanWithAcneAndTexture: ScanResult = {
      version: 1,
      skinHealthScore: 50,
      zoneScores: {
        forehead: { acne: 85, texture: 80, redness: 10, pigmentation: 10, dryness: 10, oiliness: 10 },
      },
      findings: [],
      metadata: { modelVersion: "v1.0", processingTimeMs: 100 },
    };

    const routine = generateRoutine(
      scanWithAcneAndTexture,
      { skinType: "OILY", concerns: ["ACNE", "TEXTURE"], isPregnant: false },
      mockProducts,
    );

    // Glycolic and Salicylic should never both be in amSteps or pmSteps
    const allIngredients = [
      ...routine.amSteps.flatMap((s) => s.targetIngredients),
      ...routine.pmSteps.flatMap((s) => s.targetIngredients),
    ].map((i) => i.toLowerCase());

    const hasGlycolic = allIngredients.some((i) => i.includes("glycolic"));
    const hasSalicylic = allIngredients.some((i) => i.includes("salicylic"));

    expect(hasGlycolic && hasSalicylic).toBe(false);
  });

  it("should exclude Retinol and Benzoyl Peroxide when isPregnant is true", () => {
    const scanWithAcneAndAging: ScanResult = {
      version: 1,
      skinHealthScore: 55,
      zoneScores: {
        forehead: { acne: 75, texture: 60, redness: 10, pigmentation: 10, dryness: 10, oiliness: 10 },
      },
      findings: [],
      metadata: { modelVersion: "v1.0", processingTimeMs: 100 },
    };

    const routine = generateRoutine(
      scanWithAcneAndAging,
      { skinType: "COMBINATION", concerns: ["ACNE", "FINE_LINES"], isPregnant: true },
      mockProducts,
    );

    const allSteps = [...routine.amSteps, ...routine.pmSteps];
    for (const step of allSteps) {
      for (const ing of step.targetIngredients) {
        expect(ing.toLowerCase()).not.toContain("retinol");
        expect(ing.toLowerCase()).not.toContain("benzoyl peroxide");
      }
    }
  });

  it("should exclude products containing user allergens", () => {
    const routine = generateRoutine(
      baseScanResult,
      {
        skinType: "DRY",
        concerns: ["DRYNESS"],
        allergies: ["Fragrance"],
        isPregnant: false,
      },
      mockProducts,
    );

    const allSteps = [...routine.amSteps, ...routine.pmSteps];
    const pickedFragranceProd = allSteps.find((s) => s.productId === "moisturizer-fragrance");
    expect(pickedFragranceProd).toBeUndefined();

    // Scented moisturizer was rejected; barrier moisturizer was picked instead
    const pickedBarrierMoisturizer = allSteps.find((s) => s.productId === "moisturizer-1");
    expect(pickedBarrierMoisturizer).toBeDefined();
  });
});
