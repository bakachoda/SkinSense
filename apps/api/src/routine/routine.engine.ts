import {
  SkinConcern,
  ProductCategory,
  CONCERN_INGREDIENT_MAP,
  CONFLICT_RULES,
  TreatmentPhase,
  type ScanResult,
  type UserProfile,
  type Routine,
  type RoutineStep,
  type Conflict,
  type IngredientRecommendation,
  type RoutineTier,
  type PhasedIntroductionPlan,
  type RoutineCalendar,
  type AdaptiveScanSchedule,
  type UserProduct,
  type MedicationRecord,
  type ProductConflictWarning,
  type ComedogenicityAlert,
} from "@skinsense/types";

export interface CatalogProduct {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory | string;
  skinTypes: string[];
  concerns: string[];
  ingredients: string[];
  activeIngredients: any;
  priceTier?: string;
  imageUrl?: string | null;
  purchaseUrl?: string | null;
  isActive?: boolean;
}

export interface RoutineOptions {
  barrierScore?: number;
  complexityTier?: RoutineTier;
  userProducts?: UserProduct[];
  medications?: MedicationRecord[];
  sleepSchedule?: { sleepHour: number; wakeHour: number };
  fitzpatrick?: number;
}

// Comedogenic ingredients database (0-5 scale)
const COMEDOGENIC_DATABASE: Record<string, number> = {
  "isopropyl myristate": 5,
  "isopropyl isostearate": 5,
  "myristyl myristate": 5,
  "laureth-4": 5,
  "acetylated lanolin": 4,
  "cocoa butter": 4,
  "coconut oil": 4,
  "wheat germ oil": 5,
  "algae extract": 4,
  "sodium chloride": 4,
};

// Known Clinical Synergies (Phase 4, Section 16)
const CLINICAL_SYNERGIES = [
  {
    ingredients: ["Vitamin C", "Vitamin E", "Ferulic Acid"],
    effect: "8x photoprotection boost vs. vitamin C alone",
  },
  {
    ingredients: ["Niacinamide", "Zinc PCA"],
    effect: "Enhanced sebum regulation and pore tightening",
  },
  {
    ingredients: ["Retinol", "Peptides"],
    effect: "Enhanced pro-collagen synthesis with attenuated retinoid irritation",
  },
  {
    ingredients: ["Hyaluronic Acid", "Ceramides", "Cholesterol"],
    effect: "Physiological lipid ratio (3:1:1) for optimal barrier repair",
  },
];

// Expected Treatment Timelines (Phase 4, Section 17)
const TREATMENT_TIMELINES: Record<string, string> = {
  DRYNESS: "1–2 weeks (Rapid epidermal stratum corneum rehydration)",
  SENSITIVITY: "2–4 weeks (Reduction in tightness and neuro-sensory stinging)",
  ACNE: "4–8 weeks (Purging possible in wks 2-3; lesion clearing by wks 6+)",
  OILINESS: "4–6 weeks (Sebum equilibration via niacinamide & zinc)",
  TEXTURE: "6–8 weeks (Keratinocyte turnover remodeling)",
  REDNESS: "2–4 months (Capillary stabilization and erythema fading)",
  PIGMENTATION: "3–6 months (Melanosome transfer inhibition)",
  FINE_LINES: "3–6 months (Dermal pro-collagen remodeling with retinoid)",
};

interface ConcernTracker {
  total: number;
  count: number;
}

/**
 * Phase 4 Multi-Stage Clinical Routine Pipeline (Phase 4, Section 22)
 */
export function generateRoutine(
  scanResult: ScanResult,
  userProfile: Partial<UserProfile> & {
    skinType?: string | null;
    allergies?: string[];
    isPregnant?: boolean;
    concerns?: string[];
    chronologicalAge?: number;
    fitzpatrick?: number;
  },
  products: CatalogProduct[],
  options: RoutineOptions = {},
): Routine {
  const {
    barrierScore = (scanResult as any).barrierScore ?? 78,
    complexityTier = "STANDARD",
    userProducts = [],
    medications = [],
    sleepSchedule = { sleepHour: 23, wakeHour: 7 },
    fitzpatrick = userProfile.fitzpatrick ?? 3,
  } = options;

  // ==========================================
  // STAGE 1: CONCERN RANKING & ACCUTANE OVERRIDE
  // ==========================================
  const concernSeverities: Record<string, ConcernTracker> = {
    ACNE: { total: 0, count: 0 },
    REDNESS: { total: 0, count: 0 },
    PIGMENTATION: { total: 0, count: 0 },
    DRYNESS: { total: 0, count: 0 },
    FINE_LINES: { total: 0, count: 0 },
    OILINESS: { total: 0, count: 0 },
    TEXTURE: { total: 0, count: 0 },
    SENSITIVITY: { total: 0, count: 0 },
  };

  const addScore = (concernKey: string, value: unknown) => {
    if (typeof value === "number" && !isNaN(value)) {
      const tracker = concernSeverities[concernKey];
      if (tracker) {
        tracker.total += value;
        tracker.count += 1;
      }
    }
  };

  if (scanResult.zoneScores) {
    for (const zone of Object.values(scanResult.zoneScores)) {
      if (!zone) continue;
      const z = zone as Record<string, number | undefined>;
      addScore("ACNE", z["acne"]);
      addScore("REDNESS", z["redness"]);
      addScore("PIGMENTATION", z["pigmentation"]);
      addScore("DRYNESS", z["dryness"]);
      addScore("OILINESS", z["oiliness"]);
      addScore("TEXTURE", z["texture"]);
      addScore("FINE_LINES", z["fine_lines"]);
    }
  }

  // Quiz top concerns priority boost
  if (userProfile.concerns && Array.isArray(userProfile.concerns)) {
    for (const c of userProfile.concerns) {
      const key = c.toUpperCase();
      const tracker = concernSeverities[key];
      if (tracker) {
        tracker.total += 25;
        tracker.count += 1;
      }
    }
  }

  const rankedConcerns = Object.entries(concernSeverities)
    .map(([concern, data]) => ({
      concern: concern as SkinConcern,
      avgSeverity: data.count > 0 ? data.total / data.count : 0,
    }))
    .sort((a, b) => b.avgSeverity - a.avgSeverity);

  // ==========================================
  // STAGE 2: MEDICATION SAFETY RESTRICTIONS
  // ==========================================
  const isOnAccutane = medications.some(
    (m) => m.isActive && (m.name.toLowerCase().includes("accutane") || m.name.toLowerCase().includes("isotretinoin")),
  );
  const isOnPrescriptionTretinoin = medications.some(
    (m) => m.isActive && m.name.toLowerCase().includes("tretinoin"),
  );

  // ==========================================
  // STAGE 3: TREATMENT DEPENDENCY GRAPH (Phase 0-4)
  // ==========================================
  let currentPhase: TreatmentPhase = TreatmentPhase.MAINTENANCE;
  let phaseName = "Maintenance & Photoprotection";
  let barrierLockoutActive = false;
  let barrierLockoutMessage: string | undefined;

  const hasInflammation = (concernSeverities["ACNE"]?.total || 0) > 40 || (concernSeverities["REDNESS"]?.total || 0) > 40;
  const hasPigmentMarks = (concernSeverities["PIGMENTATION"]?.total || 0) > 35;
  const hasTextureOrAging = (concernSeverities["FINE_LINES"]?.total || 0) > 35 || (concernSeverities["TEXTURE"]?.total || 0) > 40;

  if (barrierScore < 40 || isOnAccutane) {
    currentPhase = TreatmentPhase.BARRIER_REPAIR;
    phaseName = "Phase 0: Barrier Repair & Stratum Corneum Restoration";
    barrierLockoutActive = true;
    barrierLockoutMessage = isOnAccutane
      ? "Oral isotretinoin (Accutane) active. Strict minimal barrier routine enforced — all exfoliants and retinoids locked out."
      : "Skin barrier score below 40. Active treatment ingredients are temporarily locked out to prevent chemical irritation. Prioritize ceramides, centella, and gentle hydration.";
  } else if (hasInflammation) {
    currentPhase = TreatmentPhase.ANTI_INFLAMMATION;
    phaseName = "Phase 1: Anti-Inflammation & Follicular Decongestion";
  } else if (hasPigmentMarks) {
    currentPhase = TreatmentPhase.POST_INFLAMMATORY;
    phaseName = "Phase 2: Post-Inflammatory Hyperpigmentation & Erythema Resolution";
  } else if (hasTextureOrAging) {
    currentPhase = TreatmentPhase.TEXTURE_AGING;
    phaseName = "Phase 3: Dermal Texture Remodeling & Cellular Renewal";
  } else {
    currentPhase = TreatmentPhase.MAINTENANCE;
    phaseName = "Phase 4: Long-Term Barrier Preservation & Antioxidant Defense";
  }

  // ==========================================
  // STAGE 4: INGREDIENT SELECTION & PHASE LOCKOUT
  // ==========================================
  const selectedConcerns = rankedConcerns.slice(0, 3).map((c) => c.concern);
  let candidateIngredients: (IngredientRecommendation & { forConcern: SkinConcern })[] = [];

  for (const concern of selectedConcerns) {
    const recs = CONCERN_INGREDIENT_MAP[concern] || [];
    for (const rec of recs) {
      candidateIngredients.push({ ...rec, forConcern: concern });
    }
  }

  // Barrier Lockout: filter out all harsh actives if in Phase 0 (BARRIER_REPAIR)
  if (barrierLockoutActive) {
    candidateIngredients = candidateIngredients.filter((item) => {
      const name = item.ingredient.toLowerCase();
      const isHarsh =
        name.includes("retin") ||
        name.includes("glycolic") ||
        name.includes("salicylic") ||
        name.includes("benzoyl peroxide") ||
        name.includes("l-ascorbic");
      return !isHarsh;
    });

    // Inject mandatory barrier restoratives
    candidateIngredients.unshift(
      { ingredient: "Ceramides", concentration: null, step: "MOISTURIZER", priority: 1, forConcern: "SENSITIVITY" as SkinConcern },
      { ingredient: "Centella Asiatica", concentration: null, step: "SERUM", priority: 2, forConcern: "REDNESS" as SkinConcern },
      { ingredient: "Hyaluronic Acid", concentration: null, step: "SERUM", priority: 3, forConcern: "DRYNESS" as SkinConcern },
    );
  }

  // Tretinoin check: remove OTC Retinol if user already has prescription tretinoin
  if (isOnPrescriptionTretinoin) {
    candidateIngredients = candidateIngredients.filter((item) => {
      return !item.ingredient.toLowerCase().includes("retin");
    });
  }

  // Pregnancy contraindication filter
  if (userProfile.isPregnant) {
    candidateIngredients = candidateIngredients.filter((item) => {
      const name = item.ingredient.toLowerCase();
      if (name.includes("retin")) return false;
      if (name.includes("benzoyl peroxide")) return false;
      if (name.includes("salicylic acid") && item.concentration && parseFloat(item.concentration) > 2) return false;
      return true;
    });
  }

  // Allergen filtering
  const userAllergies = (userProfile.allergies || []).map((a) => a.toLowerCase().trim());
  if (userAllergies.length > 0) {
    candidateIngredients = candidateIngredients.filter((item) => {
      const ingLower = item.ingredient.toLowerCase();
      return !userAllergies.some((allergy) => allergy.length > 2 && ingLower.includes(allergy));
    });
  }

  // ==========================================
  // STAGE 5: SYNERGY BOOSTING
  // ==========================================
  // If Vitamin C is candidate, check for Vitamin E or Ferulic Acid synergy
  const hasVitC = candidateIngredients.some((c) => c.ingredient.toLowerCase().includes("vitamin c"));
  if (hasVitC && !barrierLockoutActive) {
    candidateIngredients.push({
      ingredient: "Ferulic Acid",
      concentration: "0.5%",
      step: "SERUM",
      priority: 2,
      forConcern: "PIGMENTATION" as SkinConcern,
    });
  }

  // ==========================================
  // STAGE 6: CONFLICT RESOLUTION
  // ==========================================
  const activeSelected: (IngredientRecommendation & {
    timing: "AM" | "PM" | "BOTH";
    forConcern: SkinConcern;
  })[] = [];
  const recordedConflicts: Conflict[] = [];

  for (const candidate of candidateIngredients) {
    const existing = activeSelected.find(
      (a) => a.ingredient.toLowerCase() === candidate.ingredient.toLowerCase(),
    );
    if (existing) continue;

    let drop = false;
    let timing: "AM" | "PM" | "BOTH" = "BOTH";

    for (const rule of CONFLICT_RULES) {
      const candMatchesA = candidate.ingredient.toLowerCase().includes(rule.ingredientA.toLowerCase());
      const candMatchesB = candidate.ingredient.toLowerCase().includes(rule.ingredientB.toLowerCase());

      for (const sel of activeSelected) {
        const selMatchesA = sel.ingredient.toLowerCase().includes(rule.ingredientA.toLowerCase());
        const selMatchesB = sel.ingredient.toLowerCase().includes(rule.ingredientB.toLowerCase());

        if ((candMatchesA && selMatchesB) || (candMatchesB && selMatchesA)) {
          recordedConflicts.push({
            ingredientA: rule.ingredientA,
            ingredientB: rule.ingredientB,
            resolution: rule.resolution,
            reason: rule.reason,
          });

          if (rule.resolution === "NEVER_SAME_ROUTINE") {
            drop = true;
            break;
          } else if (rule.resolution === "SEPARATE_AM_PM") {
            if (candidate.ingredient.toLowerCase().includes("retinol")) {
              timing = "PM";
              sel.timing = "AM";
            } else if (candidate.ingredient.toLowerCase().includes("vitamin c")) {
              timing = "AM";
              sel.timing = "PM";
            } else {
              timing = "AM";
              sel.timing = "PM";
            }
          } else if (rule.resolution === "ALTERNATE_NIGHTS") {
            timing = "PM";
          }
        }
      }
      if (drop) break;
    }

    if (!drop) {
      activeSelected.push({ ...candidate, timing, forConcern: candidate.forConcern });
    }
  }

  // ==========================================
  // STAGE 7: CURRENT USER PRODUCT CONFLICTS & COMEDOGENICITY
  // ==========================================
  const productConflicts: ProductConflictWarning[] = [];
  const comedogenicityAlerts: ComedogenicityAlert[] = [];

  for (const up of userProducts) {
    const ingList = (up.ingredients || []).map((i) => i.toLowerCase());

    // Check comedogenicity
    for (const [comedoIng, rating] of Object.entries(COMEDOGENIC_DATABASE)) {
      if (ingList.some((i) => i.includes(comedoIng))) {
        comedogenicityAlerts.push({
          productName: `${up.brand} ${up.name}`,
          ingredient: comedoIng,
          comedogenicityRating: rating,
          correlatedZone: "chin and nose",
          recommendation: `Your existing product contains ${comedoIng} (comedogenicity rating: ${rating}/5). This may contribute to follicular microcomedones.`,
        });
      }
    }

    // Check conflict between current product actives and new routine actives
    for (const sel of activeSelected) {
      for (const rule of CONFLICT_RULES) {
        const upMatchesA = ingList.some((i) => i.includes(rule.ingredientA.toLowerCase()));
        const selMatchesB = sel.ingredient.toLowerCase().includes(rule.ingredientB.toLowerCase());

        if (upMatchesA && selMatchesB) {
          productConflicts.push({
            productA: `${up.brand} ${up.name}`,
            productB: `Recommended ${sel.ingredient}`,
            ingredientA: rule.ingredientA,
            ingredientB: rule.ingredientB,
            resolution: rule.resolution,
            severity: rule.resolution === "NEVER_SAME_ROUTINE" ? "CRITICAL" : "MODERATE",
            explanation: `Your current product contains ${rule.ingredientA}, which conflicts with recommended ${rule.ingredientB}: ${rule.reason}`,
          });
        }
      }
    }
  }

  // ==========================================
  // STAGE 8: PRODUCT MATCHING & COMPLEXITY TIERS
  // ==========================================
  const isProductSafe = (product: CatalogProduct): boolean => {
    if (userProfile.isPregnant) {
      const allText = [product.name, ...(product.ingredients || [])].join(" ").toLowerCase();
      if (allText.includes("retinol") || allText.includes("retinoid")) return false;
      if (allText.includes("benzoyl peroxide")) return false;
    }
    if (userAllergies.length > 0) {
      const allIngs = (product.ingredients || []).map((i) => i.toLowerCase());
      for (const allergy of userAllergies) {
        if (allergy.length > 2 && allIngs.some((i) => i.includes(allergy))) return false;
      }
    }
    return true;
  };

  const findBestProduct = (
    category: ProductCategory,
    targetIngredient?: string,
  ): CatalogProduct | undefined => {
    const candidates = products.filter((p) => p.category === category && isProductSafe(p));
    if (candidates.length === 0) return undefined;

    if (targetIngredient) {
      const targetLower = targetIngredient.toLowerCase();
      const match = candidates.find((p) =>
        (p.ingredients || []).some((i) => i.toLowerCase().includes(targetLower)) ||
        p.name.toLowerCase().includes(targetLower),
      );
      if (match) return match;
    }

    return candidates[0];
  };

  // Determine max steps per tier
  const maxTierSteps = complexityTier === "ESSENTIAL" ? 3 : complexityTier === "STANDARD" ? 5 : 8;

  // Build AM Steps
  const amSteps: RoutineStep[] = [];
  let amOrder = 1;

  // 1. Cleanser
  const amCleanser = findBestProduct("CLEANSER");
  if (amCleanser) {
    amSteps.push({
      order: amOrder++,
      stepType: "CLEANSER",
      productId: amCleanser.id,
      productName: amCleanser.name,
      productBrand: amCleanser.brand,
      whyChosen: "Gently cleanse and prep skin without disturbing lipid barrier",
      targetIngredients: amCleanser.ingredients?.slice(0, 3) || [],
      productImageUrl: amCleanser.imageUrl || undefined,
      applicationNote: "Massage onto damp face for 45-60s, then rinse with lukewarm water",
    });
  }

  // 2. Active Serum (if allowed and within tier limits)
  if (!barrierLockoutActive && amSteps.length < maxTierSteps) {
    const amActive = activeSelected.find((a) => a.timing === "AM" || a.timing === "BOTH");
    if (amActive) {
      const serumProd = findBestProduct(amActive.step as any, amActive.ingredient) || findBestProduct("SERUM");
      if (serumProd) {
        amSteps.push({
          order: amOrder++,
          stepType: (serumProd.category as any) || "SERUM",
          productId: serumProd.id,
          productName: serumProd.name,
          productBrand: serumProd.brand,
          whyChosen: `Delivers targeted ${amActive.ingredient} for ${amActive.forConcern.toLowerCase()}`,
          targetIngredients: [amActive.ingredient],
          productImageUrl: serumProd.imageUrl || undefined,
          applicationNote: "Apply 3-4 drops to cleansed skin, pat gently until absorbed",
        });
      }
    }
  }

  // 3. Moisturizer
  const amMoisturizer = findBestProduct("MOISTURIZER");
  if (amMoisturizer && amSteps.length < maxTierSteps) {
    amSteps.push({
      order: amOrder++,
      stepType: "MOISTURIZER",
      productId: amMoisturizer.id,
      productName: amMoisturizer.name,
      productBrand: amMoisturizer.brand,
      whyChosen: "Replenish moisture and seal epidermal barrier",
      targetIngredients: amMoisturizer.ingredients?.slice(0, 3) || [],
      productImageUrl: amMoisturizer.imageUrl || undefined,
      applicationNote: "Smooth nickel-sized amount evenly over face and neck",
    });
  }

  // 4. Sunscreen (Mandatory in AM unless essential mode forced 2 steps)
  const amSpf = findBestProduct("SPF");
  if (amSpf) {
    amSteps.push({
      order: amOrder++,
      stepType: "SPF",
      productId: amSpf.id,
      productName: amSpf.name,
      productBrand: amSpf.brand,
      whyChosen: "Broad-spectrum UV photoprotection to prevent hyperpigmentation and photoaging",
      targetIngredients: amSpf.ingredients?.slice(0, 3) || [],
      productImageUrl: amSpf.imageUrl || undefined,
      applicationNote: "Apply two finger lengths 15 minutes before sun exposure",
    });
  }

  // Build PM Steps
  const pmSteps: RoutineStep[] = [];
  let pmOrder = 1;

  // 1. Cleanser
  const pmCleanser = findBestProduct("CLEANSER");
  if (pmCleanser) {
    pmSteps.push({
      order: pmOrder++,
      stepType: "CLEANSER",
      productId: pmCleanser.id,
      productName: pmCleanser.name,
      productBrand: pmCleanser.brand,
      whyChosen: "Remove daytime SPF, pollutants, and sebum accumulation",
      targetIngredients: pmCleanser.ingredients?.slice(0, 3) || [],
      productImageUrl: pmCleanser.imageUrl || undefined,
      applicationNote: "Cleanse thoroughly for 60 seconds with lukewarm water",
    });
  }

  // 2. PM Active Treatment (if not locked out)
  if (!barrierLockoutActive && pmSteps.length < maxTierSteps) {
    const pmActive = activeSelected.find((a) => a.timing === "PM" || a.timing === "BOTH");
    if (pmActive) {
      const pmActiveProd = findBestProduct(pmActive.step as any, pmActive.ingredient) || findBestProduct("TREATMENT");
      if (pmActiveProd) {
        pmSteps.push({
          order: pmOrder++,
          stepType: (pmActiveProd.category as any) || "TREATMENT",
          productId: pmActiveProd.id,
          productName: pmActiveProd.name,
          productBrand: pmActiveProd.brand,
          whyChosen: `Nighttime cell renewal and concern targeting with ${pmActive.ingredient}`,
          targetIngredients: [pmActive.ingredient],
          productImageUrl: pmActiveProd.imageUrl || undefined,
          applicationNote: "Dispense pea-sized amount onto completely dry skin; avoid immediate eye contour",
        });
      }
    }
  }

  // 3. PM Moisturizer
  const pmMoisturizer = findBestProduct("MOISTURIZER");
  if (pmMoisturizer && pmSteps.length < maxTierSteps) {
    pmSteps.push({
      order: pmOrder++,
      stepType: "MOISTURIZER",
      productId: pmMoisturizer.id,
      productName: pmMoisturizer.name,
      productBrand: pmMoisturizer.brand,
      whyChosen: "Overnight lipid replenishment to reinforce cellular stratum corneum matrix",
      targetIngredients: pmMoisturizer.ingredients?.slice(0, 3) || [],
      productImageUrl: pmMoisturizer.imageUrl || undefined,
      applicationNote: "Warm between fingers and press firmly into facial contours",
    });
  }

  // ==========================================
  // STAGE 9: 4-PHASE INTRODUCTION PLAN & RAMPING
  // ==========================================
  const phasedPlan: PhasedIntroductionPlan = {
    currentWeek: 1,
    phases: [
      {
        phase: 1,
        weekRange: [1, 2],
        title: "Baseline & Barrier Equilibrium",
        products: [
          { name: amCleanser?.name || "Gentle Cleanser", brand: amCleanser?.brand || "Core", category: "CLEANSER", frequency: "Daily AM & PM" },
          { name: amMoisturizer?.name || "Barrier Moisturizer", brand: amMoisturizer?.brand || "Core", category: "MOISTURIZER", frequency: "Daily AM & PM" },
          { name: amSpf?.name || "Broad Spectrum SPF", brand: amSpf?.brand || "Core", category: "SPF", frequency: "Daily AM" },
        ],
        checkpoint: "Establish baseline tolerance with zero active irritants.",
      },
      {
        phase: 2,
        weekRange: [3, 4],
        title: "Primary Active Introduction",
        products: [
          { name: amCleanser?.name || "Gentle Cleanser", brand: amCleanser?.brand || "Core", category: "CLEANSER", frequency: "Daily AM & PM" },
          { name: pmSteps.find((s) => s.stepType === "TREATMENT")?.productName || "Targeted Active", brand: "Clinical", category: "TREATMENT", frequency: "Every 3rd night", concentration: "Lowest OTC strength" },
          { name: amMoisturizer?.name || "Barrier Moisturizer", brand: amMoisturizer?.brand || "Core", category: "MOISTURIZER", frequency: "Daily AM & PM" },
          { name: amSpf?.name || "Broad Spectrum SPF", brand: amSpf?.brand || "Core", category: "SPF", frequency: "Daily AM" },
        ],
        checkpoint: "Re-scan at end of Week 4 to audit tolerance and check for micro-erythema.",
      },
      {
        phase: 3,
        weekRange: [5, 6],
        title: "Frequency Ramping",
        products: [
          { name: pmSteps.find((s) => s.stepType === "TREATMENT")?.productName || "Targeted Active", brand: "Clinical", category: "TREATMENT", frequency: "Every other night (Mon/Wed/Fri)" },
          { name: amMoisturizer?.name || "Barrier Moisturizer", brand: amMoisturizer?.brand || "Core", category: "MOISTURIZER", frequency: "Daily AM & PM" },
        ],
        checkpoint: "Confirm stratum corneum stability before introducing daytime antioxidant active.",
      },
      {
        phase: 4,
        weekRange: [7, 8],
        title: "Full Regimen Consolidation",
        products: [
          { name: amSteps.find((s) => s.stepType === "SERUM")?.productName || "Antioxidant Serum", brand: "Clinical", category: "SERUM", frequency: "Daily AM" },
          { name: pmSteps.find((s) => s.stepType === "TREATMENT")?.productName || "Targeted Active", brand: "Clinical", category: "TREATMENT", frequency: "Nightly PM as tolerated" },
        ],
        checkpoint: "Comprehensive multi-concern active synergy achieved. Re-scan at Week 8.",
      },
    ],
  };

  // ==========================================
  // STAGE 10: ROUTINE CALENDAR (Alternating Nights)
  // ==========================================
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
  const calendar: RoutineCalendar = {
    circadianNote:
      sleepSchedule.sleepHour < 8
        ? "Night shift circadian schedule active: Evening regimen scheduled prior to morning sleep window."
        : "Standard circadian alignment active.",
    schedule: daysOfWeek.map((day, idx) => {
      const isRestNight = idx % 2 === 1; // Tue, Thu, Sat are Rest Nights
      return {
        dayOfWeek: day,
        isRestNight,
        notes: isRestNight ? "Rest Night: Barrier recovery with hydrating moisturizer only" : "Active Treatment Night",
        amSteps: amSteps.map((s) => ({ stepOrder: s.order, productName: s.productName, category: s.stepType as any })),
        pmSteps: isRestNight
          ? pmSteps
              .filter((s) => s.stepType !== "TREATMENT")
              .map((s) => ({ stepOrder: s.order, productName: s.productName, category: s.stepType as any }))
          : pmSteps.map((s) => ({ stepOrder: s.order, productName: s.productName, category: s.stepType as any })),
      };
    }),
  };

  // ==========================================
  // STAGE 11: ADAPTIVE RE-SCAN SCHEDULING
  // ==========================================
  let scanDays = 28;
  let scanReason = "Monthly maintenance and barrier progress check-in";
  let scanUrgency: AdaptiveScanSchedule["urgency"] = "LOW";

  if (barrierLockoutActive) {
    scanDays = 14;
    scanReason = "Bi-weekly barrier recovery check-in (requires score >= 60 to unlock actives)";
    scanUrgency = "HIGH";
  } else if (productConflicts.length > 0) {
    scanDays = 7;
    scanReason = "Conflict monitor: re-scan 7 days after discontinuing conflicting product";
    scanUrgency = "MEDIUM";
  }

  const nextScanDateObj = new Date();
  nextScanDateObj.setDate(nextScanDateObj.getDate() + scanDays);

  const adaptiveScanSchedule: AdaptiveScanSchedule = {
    nextScanDate: nextScanDateObj.toISOString(),
    daysRemaining: scanDays,
    reason: scanReason,
    urgency: scanUrgency,
  };

  // Timeline with Fitzpatrick-specific PIH adjustment
  const customizedTimeline = { ...TREATMENT_TIMELINES };
  if (fitzpatrick >= 4) {
    customizedTimeline["PIGMENTATION"] = "6–12 months (Extended melanosome regulation on melanin-rich skin)";
  }

  return {
    id: `rt-${Date.now()}`,
    scanResultId: scanResult.scanId || (scanResult as any).id || `sr-${Date.now()}`,
    version: 1,
    amSteps,
    pmSteps,
    conflicts: recordedConflicts,
    treatmentPhase: currentPhase,
    phaseName,
    phasedPlan,
    calendar,
    timeline: customizedTimeline,
    complexityTier,
    productConflicts,
    comedogenicityAlerts,
    adaptiveScanSchedule,
    barrierLockoutActive,
    barrierLockoutMessage,
  };
}

