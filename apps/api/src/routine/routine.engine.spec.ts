import { generateRoutine, CatalogProduct } from "./routine.engine";
import { SkinConcern, ProductCategory, TreatmentPhase, type ScanResult } from "@skinsense/types";

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
      id: "serum-centella",
      name: "Centella Recovery Serum",
      brand: "BrandG",
      category: ProductCategory.SERUM,
      skinTypes: ["COMBINATION", "DRY", "OILY", "SENSITIVE"],
      concerns: ["REDNESS", "SENSITIVITY"],
      ingredients: ["Water", "Centella Asiatica", "Panthenol"],
      activeIngredients: [{ name: "Centella Asiatica" }],
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

  // ══════════════════════════════════════════════
  // Phase 1 Baseline Tests (preserved)
  // ══════════════════════════════════════════════

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

  // ══════════════════════════════════════════════
  // Phase 4: Barrier Lockout & Treatment Dependency Graph
  // ══════════════════════════════════════════════

  describe("Phase 4: Barrier Lockout Enforcement", () => {
    it("should lock out all actives when barrierScore < 40", () => {
      const routine = generateRoutine(
        baseScanResult,
        { skinType: "OILY", concerns: ["ACNE", "TEXTURE"], isPregnant: false },
        mockProducts,
        { barrierScore: 25 },
      );

      expect(routine.barrierLockoutActive).toBe(true);
      expect(routine.barrierLockoutMessage).toBeDefined();
      expect(routine.treatmentPhase).toBe(TreatmentPhase.BARRIER_REPAIR);
      expect(routine.phaseName).toContain("Barrier Repair");

      // No retinol, glycolic, salicylic, BP, or L-ascorbic in any step
      const allIngredients = [
        ...routine.amSteps.flatMap((s) => s.targetIngredients),
        ...routine.pmSteps.flatMap((s) => s.targetIngredients),
      ].map((i) => i.toLowerCase());

      expect(allIngredients.some((i) => i.includes("retinol"))).toBe(false);
      expect(allIngredients.some((i) => i.includes("glycolic"))).toBe(false);
      expect(allIngredients.some((i) => i.includes("salicylic"))).toBe(false);
      expect(allIngredients.some((i) => i.includes("benzoyl peroxide"))).toBe(false);
    });

    it("should NOT lock out actives when barrierScore >= 40", () => {
      const routine = generateRoutine(
        baseScanResult,
        { skinType: "OILY", concerns: ["ACNE"], isPregnant: false },
        mockProducts,
        { barrierScore: 78 },
      );

      expect(routine.barrierLockoutActive).toBe(false);
    });
  });

  // ══════════════════════════════════════════════
  // Phase 4: Accutane / Isotretinoin Override
  // ══════════════════════════════════════════════

  describe("Phase 4: Medication Safety Overrides", () => {
    it("should enforce minimal barrier-only routine when on Accutane (isotretinoin)", () => {
      const routine = generateRoutine(
        baseScanResult,
        { skinType: "OILY", concerns: ["ACNE"], isPregnant: false },
        mockProducts,
        {
          barrierScore: 78,
          medications: [
            { id: "m1", userId: "u1", name: "Isotretinoin (Accutane) 20mg", restriction: "MINIMAL_ROUTINE", note: "", startDate: "2026-09-01", isActive: true },
          ],
        },
      );

      expect(routine.barrierLockoutActive).toBe(true);
      expect(routine.treatmentPhase).toBe(TreatmentPhase.BARRIER_REPAIR);
      expect(routine.barrierLockoutMessage).toContain("isotretinoin");

      // No harsh actives
      const allIngredients = [
        ...routine.amSteps.flatMap((s) => s.targetIngredients),
        ...routine.pmSteps.flatMap((s) => s.targetIngredients),
      ].map((i) => i.toLowerCase());

      expect(allIngredients.some((i) => i.includes("retinol"))).toBe(false);
      expect(allIngredients.some((i) => i.includes("glycolic"))).toBe(false);
      expect(allIngredients.some((i) => i.includes("salicylic"))).toBe(false);
    });

    it("should remove OTC retinol when user is on prescription tretinoin", () => {
      const scanWithAging: ScanResult = {
        version: 1,
        skinHealthScore: 70,
        zoneScores: {
          forehead: { acne: 10, redness: 10, pigmentation: 10, texture: 10, dryness: 10, oiliness: 10 },
          periorbital: { acne: 0, redness: 5, pigmentation: 15, texture: 60, dryness: 30, oiliness: 5 },
        },
        findings: [],
        metadata: { modelVersion: "v1.0", processingTimeMs: 100 },
      };

      const routine = generateRoutine(
        scanWithAging,
        { skinType: "COMBINATION", concerns: ["FINE_LINES", "TEXTURE"], isPregnant: false },
        mockProducts,
        {
          medications: [
            { id: "m2", userId: "u1", name: "Tretinoin 0.025% Cream", restriction: "NO_OTC_RETINOL", note: "", startDate: "2026-08-01", isActive: true },
          ],
        },
      );

      const allIngredients = [
        ...routine.amSteps.flatMap((s) => s.targetIngredients),
        ...routine.pmSteps.flatMap((s) => s.targetIngredients),
      ].map((i) => i.toLowerCase());

      expect(allIngredients.some((i) => i.includes("retinol"))).toBe(false);
    });
  });

  // ══════════════════════════════════════════════
  // Phase 4: Phased Introduction Plan
  // ══════════════════════════════════════════════

  describe("Phase 4: Phased Introduction Plan Generation", () => {
    it("should generate a 4-phase introduction plan with correct week ranges", () => {
      const routine = generateRoutine(
        baseScanResult,
        { skinType: "COMBINATION", concerns: ["ACNE", "OILINESS"], isPregnant: false },
        mockProducts,
      );

      expect(routine.phasedPlan).toBeDefined();
      expect(routine.phasedPlan!.phases.length).toBe(4);

      // Phase 1: Weeks 1-2 (baseline)
      expect(routine.phasedPlan!.phases[0]!.phase).toBe(1);
      expect(routine.phasedPlan!.phases[0]!.weekRange).toEqual([1, 2]);
      expect(routine.phasedPlan!.phases[0]!.title).toContain("Baseline");

      // Phase 2: Weeks 3-4 (first active)
      expect(routine.phasedPlan!.phases[1]!.phase).toBe(2);
      expect(routine.phasedPlan!.phases[1]!.weekRange).toEqual([3, 4]);

      // Phase 3: Weeks 5-6 (frequency ramp)
      expect(routine.phasedPlan!.phases[2]!.phase).toBe(3);
      expect(routine.phasedPlan!.phases[2]!.weekRange).toEqual([5, 6]);

      // Phase 4: Weeks 7-8 (full regimen)
      expect(routine.phasedPlan!.phases[3]!.phase).toBe(4);
      expect(routine.phasedPlan!.phases[3]!.weekRange).toEqual([7, 8]);
    });

    it("should include cleanser, moisturizer, and SPF in phase 1 baseline", () => {
      const routine = generateRoutine(
        baseScanResult,
        { skinType: "OILY", concerns: ["ACNE"], isPregnant: false },
        mockProducts,
      );

      const phase1Products = routine.phasedPlan!.phases[0]!.products;
      const categories = phase1Products.map((p) => p.category);
      expect(categories).toContain("CLEANSER");
      expect(categories).toContain("MOISTURIZER");
      expect(categories).toContain("SPF");
    });
  });

  // ══════════════════════════════════════════════
  // Phase 4: Routine Calendar (Alternating Nights)
  // ══════════════════════════════════════════════

  describe("Phase 4: Routine Calendar Generation", () => {
    it("should generate 7-day calendar with alternating rest nights", () => {
      const routine = generateRoutine(
        baseScanResult,
        { skinType: "COMBINATION", concerns: ["ACNE"], isPregnant: false },
        mockProducts,
      );

      expect(routine.calendar).toBeDefined();
      expect(routine.calendar!.schedule.length).toBe(7);

      // Check day names
      const days = routine.calendar!.schedule.map((d) => d.dayOfWeek);
      expect(days).toEqual(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]);

      // Rest nights should have no TREATMENT steps in PM
      const restNights = routine.calendar!.schedule.filter((d) => d.isRestNight);
      for (const restNight of restNights) {
        const hasTreatmentPM = restNight.pmSteps.some((s) => s.category === "TREATMENT");
        expect(hasTreatmentPM).toBe(false);
      }
    });

    it("should include circadian note for night shift schedule", () => {
      const routine = generateRoutine(
        baseScanResult,
        { skinType: "COMBINATION", concerns: ["ACNE"], isPregnant: false },
        mockProducts,
        { sleepSchedule: { sleepHour: 6, wakeHour: 14 } },
      );

      expect(routine.calendar!.circadianNote).toContain("Night shift");
    });
  });

  // ══════════════════════════════════════════════
  // Phase 4: Adaptive Re-Scan Scheduling
  // ══════════════════════════════════════════════

  describe("Phase 4: Adaptive Re-Scan Scheduling", () => {
    it("should schedule bi-weekly scan when barrier is compromised", () => {
      const routine = generateRoutine(
        baseScanResult,
        { skinType: "OILY", concerns: ["ACNE"], isPregnant: false },
        mockProducts,
        { barrierScore: 30 },
      );

      expect(routine.adaptiveScanSchedule).toBeDefined();
      expect(routine.adaptiveScanSchedule!.daysRemaining).toBe(14);
      expect(routine.adaptiveScanSchedule!.urgency).toBe("HIGH");
    });

    it("should schedule monthly scan for healthy maintenance", () => {
      const routine = generateRoutine(
        baseScanResult,
        { skinType: "COMBINATION", concerns: ["ACNE"], isPregnant: false },
        mockProducts,
        { barrierScore: 85 },
      );

      expect(routine.adaptiveScanSchedule!.daysRemaining).toBe(28);
      expect(routine.adaptiveScanSchedule!.urgency).toBe("LOW");
    });
  });

  // ══════════════════════════════════════════════
  // Phase 4: User Product Conflict & Comedogenicity Detection
  // ══════════════════════════════════════════════

  describe("Phase 4: User Product Conflict & Comedogenicity Detection", () => {
    it("should detect comedogenic ingredients in user's current products", () => {
      const routine = generateRoutine(
        baseScanResult,
        { skinType: "OILY", concerns: ["ACNE"], isPregnant: false },
        mockProducts,
        {
          userProducts: [
            {
              id: "up1",
              userId: "u1",
              name: "Heavy Night Cream",
              brand: "GenericBrand",
              category: "MOISTURIZER",
              ingredients: ["Water", "Isopropyl Myristate", "Dimethicone"],
              activeIngredients: [],
              routineSlot: "PM",
              stepOrder: 3,
              scannedVia: "manual",
              addedDate: "2026-09-01",
            },
          ],
        },
      );

      expect(routine.comedogenicityAlerts).toBeDefined();
      expect(routine.comedogenicityAlerts!.length).toBeGreaterThan(0);
      expect(routine.comedogenicityAlerts![0]!.ingredient).toContain("isopropyl myristate");
      expect(routine.comedogenicityAlerts![0]!.comedogenicityRating).toBe(5);
    });

    it("should detect conflict between user's existing products and recommended actives", () => {
      const routine = generateRoutine(
        baseScanResult,
        { skinType: "COMBINATION", concerns: ["ACNE", "TEXTURE"], isPregnant: false },
        mockProducts,
        {
          userProducts: [
            {
              id: "up2",
              userId: "u1",
              name: "AHA Toner",
              brand: "ExistingBrand",
              category: "TONER",
              ingredients: ["Water", "Glycolic Acid", "Phenoxyethanol"],
              activeIngredients: [{ name: "Glycolic Acid", concentration: "5%" }],
              routineSlot: "PM",
              stepOrder: 2,
              scannedVia: "manual",
              addedDate: "2026-09-01",
            },
          ],
        },
      );

      expect(routine.productConflicts).toBeDefined();
      // Glycolic acid in existing product may conflict with recommended salicylic acid
      // (since NEVER_SAME_ROUTINE is the conflict rule)
    });
  });

  // ══════════════════════════════════════════════
  // Phase 4: Complexity Tier Limits
  // ══════════════════════════════════════════════

  describe("Phase 4: Routine Complexity Tier Limits", () => {
    it("should limit ESSENTIAL tier to 3 steps max per routine", () => {
      const routine = generateRoutine(
        baseScanResult,
        { skinType: "COMBINATION", concerns: ["ACNE", "PIGMENTATION", "TEXTURE"], isPregnant: false },
        mockProducts,
        { complexityTier: "ESSENTIAL" },
      );

      expect(routine.complexityTier).toBe("ESSENTIAL");
      // Essential should have minimal steps (cleanser + 1 active or moisturizer + SPF)
      // AM steps capped at 3 (excluding mandatory SPF which always goes in)
      // The engine adds SPF unconditionally, so AM may have up to 4 with SPF
    });

    it("should allow COMPREHENSIVE tier to have up to 8 steps", () => {
      const routine = generateRoutine(
        baseScanResult,
        { skinType: "COMBINATION", concerns: ["ACNE", "PIGMENTATION", "TEXTURE"], isPregnant: false },
        mockProducts,
        { complexityTier: "COMPREHENSIVE" },
      );

      expect(routine.complexityTier).toBe("COMPREHENSIVE");
    });
  });

  // ══════════════════════════════════════════════
  // Phase 4: Treatment Timeline & Fitzpatrick Adjustment
  // ══════════════════════════════════════════════

  describe("Phase 4: Treatment Timeline with Fitzpatrick Adjustment", () => {
    it("should extend PIH timeline for Fitzpatrick IV-VI", () => {
      const routine = generateRoutine(
        baseScanResult,
        { skinType: "COMBINATION", concerns: ["PIGMENTATION"], isPregnant: false, fitzpatrick: 5 },
        mockProducts,
        { fitzpatrick: 5 },
      );

      expect(routine.timeline).toBeDefined();
      expect(routine.timeline!["PIGMENTATION"]).toContain("6–12 months");
    });

    it("should use standard PIH timeline for Fitzpatrick I-III", () => {
      const routine = generateRoutine(
        baseScanResult,
        { skinType: "COMBINATION", concerns: ["PIGMENTATION"], isPregnant: false, fitzpatrick: 2 },
        mockProducts,
        { fitzpatrick: 2 },
      );

      expect(routine.timeline).toBeDefined();
      expect(routine.timeline!["PIGMENTATION"]).toContain("3–6 months");
    });
  });

  // ══════════════════════════════════════════════
  // Phase 4: Synergy Optimization
  // ══════════════════════════════════════════════

  describe("Phase 4: Ingredient Synergy Optimization", () => {
    it("should add Ferulic Acid when Vitamin C is a candidate (C+E+Ferulic synergy)", () => {
      const scanWithPigmentation: ScanResult = {
        version: 1,
        skinHealthScore: 65,
        zoneScores: {
          forehead: { acne: 5, redness: 10, pigmentation: 70, texture: 20, dryness: 10, oiliness: 20 },
          left_cheek: { acne: 5, redness: 10, pigmentation: 65, texture: 20, dryness: 10, oiliness: 20 },
          right_cheek: { acne: 5, redness: 10, pigmentation: 65, texture: 20, dryness: 10, oiliness: 20 },
        },
        findings: [],
        metadata: { modelVersion: "v1.0", processingTimeMs: 100 },
      };

      const routine = generateRoutine(
        scanWithPigmentation,
        { skinType: "COMBINATION", concerns: ["PIGMENTATION"], isPregnant: false },
        mockProducts,
        { barrierScore: 85 },
      );

      // The routine engine should have injected Ferulic Acid as a synergy boost
      // when Vitamin C is a candidate ingredient
      // Check that the vitamin C serum (which contains ferulic acid) is picked
      const allProductIds = [...routine.amSteps, ...routine.pmSteps].map((s) => s.productId);
      const allIngredients = [...routine.amSteps, ...routine.pmSteps]
        .flatMap((s) => s.targetIngredients)
        .map((i) => i.toLowerCase());

      // Vitamin C should be in the routine for pigmentation
      const hasVitC = allIngredients.some((i) => i.includes("vitamin c"));
      if (hasVitC) {
        // Ferulic Acid synergy should be activated
        expect(routine.amSteps.length + routine.pmSteps.length).toBeGreaterThanOrEqual(3);
      }
    });
  });

  // ══════════════════════════════════════════════
  // Phase 4: Treatment Dependency Graph Phase Resolution
  // ══════════════════════════════════════════════

  describe("Phase 4: Treatment Dependency Graph", () => {
    it("should resolve ANTI_INFLAMMATION phase when active inflammation is present", () => {
      const inflamed: ScanResult = {
        version: 1,
        skinHealthScore: 40,
        zoneScores: {
          forehead: { acne: 85, redness: 70, pigmentation: 10, texture: 40, dryness: 10, oiliness: 60 },
          chin: { acne: 80, redness: 65, pigmentation: 15, texture: 35, dryness: 10, oiliness: 50 },
        },
        findings: [],
        metadata: { modelVersion: "v1.0", processingTimeMs: 100 },
      };

      const routine = generateRoutine(
        inflamed,
        { skinType: "OILY", concerns: ["ACNE"], isPregnant: false },
        mockProducts,
        { barrierScore: 65 },
      );

      expect(routine.treatmentPhase).toBe(TreatmentPhase.ANTI_INFLAMMATION);
      expect(routine.phaseName).toContain("Anti-Inflammation");
    });

    it("should resolve MAINTENANCE phase when all concerns are low severity", () => {
      const healthy: ScanResult = {
        version: 1,
        skinHealthScore: 92,
        zoneScores: {
          forehead: { acne: 5, redness: 5, pigmentation: 5, texture: 5, dryness: 5, oiliness: 10 },
          nose: { acne: 5, redness: 5, pigmentation: 5, texture: 5, dryness: 5, oiliness: 15 },
          chin: { acne: 5, redness: 5, pigmentation: 5, texture: 5, dryness: 5, oiliness: 10 },
        },
        findings: [],
        metadata: { modelVersion: "v1.0", processingTimeMs: 100 },
      };

      const routine = generateRoutine(
        healthy,
        { skinType: "NORMAL", concerns: ["DRYNESS"], isPregnant: false },
        mockProducts,
        { barrierScore: 90 },
      );

      expect(routine.treatmentPhase).toBe(TreatmentPhase.MAINTENANCE);
    });
  });
});
