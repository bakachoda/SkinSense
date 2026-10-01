import {
  SkinConcern,
  ProductCategory,
  CONCERN_INGREDIENT_MAP,
  CONFLICT_RULES,
  type ScanResult,
  type UserProfile,
  type Routine,
  type RoutineStep,
  type Conflict,
  type IngredientRecommendation,
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

interface ConcernTracker {
  total: number;
  count: number;
}

export function generateRoutine(
  scanResult: ScanResult,
  userProfile: Partial<UserProfile> & {
    skinType?: string | null;
    allergies?: string[];
    isPregnant?: boolean;
    concerns?: string[];
  },
  products: CatalogProduct[],
): Routine {
  // 1. Calculate average severity for each concern across all zones
  const concernSeverities: Record<string, ConcernTracker> = {
    ["ACNE"]: { total: 0, count: 0 },
    ["REDNESS"]: { total: 0, count: 0 },
    ["PIGMENTATION"]: { total: 0, count: 0 },
    ["DRYNESS"]: { total: 0, count: 0 },
    ["FINE_LINES"]: { total: 0, count: 0 },
    ["OILINESS"]: { total: 0, count: 0 },
    ["TEXTURE"]: { total: 0, count: 0 },
    ["SENSITIVITY"]: { total: 0, count: 0 },
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

  // If user selected top concerns in questionnaire, add a baseline boost
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

  // Compute average score
  const rankedConcerns = Object.entries(concernSeverities)
    .map(([concern, data]) => ({
      concern: concern as SkinConcern,
      avgSeverity: data.count > 0 ? data.total / data.count : 0,
    }))
    .sort((a, b) => b.avgSeverity - a.avgSeverity);

  // 2. Select top 3 concerns (or minimum 1 if all 0)
  const topConcerns = rankedConcerns.slice(0, 3).filter((c) => c.avgSeverity > 0);
  const selectedConcerns: SkinConcern[] = topConcerns.length > 0
    ? topConcerns.map((c) => c.concern)
    : ["DRYNESS" as SkinConcern, "ACNE" as SkinConcern];

  // 3. Map concerns to target ingredients
  let candidateIngredients: (IngredientRecommendation & { forConcern: SkinConcern })[] = [];
  for (const concern of selectedConcerns) {
    const recs = CONCERN_INGREDIENT_MAP[concern] || [];
    for (const rec of recs) {
      candidateIngredients.push({ ...rec, forConcern: concern });
    }
  }

  // 4. Pregnancy check (filter out contraindicated ingredients)
  if (userProfile.isPregnant) {
    candidateIngredients = candidateIngredients.filter((item) => {
      const name = item.ingredient.toLowerCase();
      if (name.includes("retinol") || name.includes("retinoid") || name.includes("retin")) return false;
      if (name.includes("benzoyl peroxide")) return false;
      if (name.includes("salicylic acid") && item.concentration && parseFloat(item.concentration) > 2) return false;
      return true;
    });
  }

  // 5. Allergen filtering
  const userAllergies = (userProfile.allergies || []).map((a) => a.toLowerCase().trim());
  if (userAllergies.length > 0) {
    candidateIngredients = candidateIngredients.filter((item) => {
      const ingLower = item.ingredient.toLowerCase();
      return !userAllergies.some((allergy) => allergy.length > 2 && ingLower.includes(allergy));
    });
  }

  // 6. Check conflicts and resolve
  const activeSelected: (IngredientRecommendation & {
    timing: "AM" | "PM" | "BOTH";
    forConcern: SkinConcern;
  })[] = [];

  const recordedConflicts: Conflict[] = [];

  for (const candidate of candidateIngredients) {
    // Check if ingredient is already added
    const existing = activeSelected.find(
      (a) => a.ingredient.toLowerCase() === candidate.ingredient.toLowerCase(),
    );
    if (existing) continue;

    // Check conflict rules against already selected ingredients
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
            // Drop candidate in favor of higher priority selected ingredient
            drop = true;
            break;
          } else if (rule.resolution === "SEPARATE_AM_PM") {
            // Assign Vitamin C / AHA to AM, Retinol / Niacinamide to PM
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

  // Product allergen check helper
  const isProductSafe = (product: CatalogProduct): boolean => {
    if (!userAllergies.length) return true;
    for (const ingredient of product.ingredients) {
      const ingLower = ingredient.toLowerCase();
      for (const allergy of userAllergies) {
        if (allergy.length > 2 && ingLower.includes(allergy)) {
          return false;
        }
      }
    }
    return true;
  };

  // Product matching helper
  const findBestProduct = (
    category: ProductCategory | string,
    targetIngredient?: string,
    forConcern?: SkinConcern,
  ): CatalogProduct | null => {
    const candidates = products.filter(
      (p) => p.category === category && (p.isActive !== false) && isProductSafe(p),
    );

    if (candidates.length === 0) return null;

    let bestScore = -1;
    let bestProduct: CatalogProduct | null = candidates[0] ?? null;

    const userSkinType = userProfile.skinType?.toUpperCase();

    for (const prod of candidates) {
      let score = 0;

      // Matches user's skin type
      if (userSkinType && prod.skinTypes.some((st) => st.toUpperCase() === userSkinType)) {
        score += 10;
      }

      // Contains target active ingredient
      if (targetIngredient) {
        const targetLower = targetIngredient.toLowerCase();
        const hasInActive = Array.isArray(prod.activeIngredients) &&
          prod.activeIngredients.some((ai: any) =>
            typeof ai.name === "string" && ai.name.toLowerCase().includes(targetLower),
          );
        const hasInIngredients = prod.ingredients.some((ing) =>
          ing.toLowerCase().includes(targetLower),
        );

        if (hasInActive) score += 25;
        else if (hasInIngredients) score += 15;
      }

      // Matches target concern
      if (forConcern && prod.concerns.some((c) => c.toUpperCase() === forConcern.toUpperCase())) {
        score += 8;
      }

      if (score > bestScore) {
        bestScore = score;
        bestProduct = prod;
      }
    }

    return bestProduct;
  };

  // 8. Build AM steps
  const amSteps: RoutineStep[] = [];
  let amOrder = 1;

  // AM Cleanser
  const amCleanser = findBestProduct(ProductCategory.CLEANSER, undefined, selectedConcerns[0]);
  if (amCleanser) {
    amSteps.push({
      order: amOrder++,
      stepType: "CLEANSER",
      productId: amCleanser.id,
      productName: amCleanser.name,
      productBrand: amCleanser.brand,
      productImageUrl: amCleanser.imageUrl ?? undefined,
      targetIngredients: ["Gentle Surfactants"],
      whyChosen: `Gently cleanses and preps skin without disturbing barrier function`,
      applicationNote: "Massage gently onto damp face for 60 seconds, then rinse with lukewarm water",
    });
  }

  // AM Active Serums / Treatments (timing === 'AM' or 'BOTH')
  const amActives = activeSelected.filter((a) => a.timing === "AM" || a.timing === "BOTH").slice(0, 2);
  for (const active of amActives) {
    const category = active.step === "TREATMENT" ? ProductCategory.TREATMENT : ProductCategory.SERUM;
    const prod = findBestProduct(category, active.ingredient, active.forConcern);
    if (prod && !amSteps.some((s) => s.productId === prod.id)) {
      amSteps.push({
        order: amOrder++,
        stepType: active.step === "TREATMENT" ? "TREATMENT" : "SERUM",
        productId: prod.id,
        productName: prod.name,
        productBrand: prod.brand,
        productImageUrl: prod.imageUrl ?? undefined,
        targetIngredients: [active.ingredient],
        whyChosen: `Targets ${active.forConcern.toLowerCase()} with ${active.ingredient}${active.concentration ? ` (${active.concentration})` : ""}`,
        applicationNote: "Apply 2-3 drops to entire face and press gently into skin",
      });
    }
  }

  // AM Moisturizer
  const amMoisturizer = findBestProduct(ProductCategory.MOISTURIZER, undefined, selectedConcerns[0]);
  if (amMoisturizer && !amSteps.some((s) => s.productId === amMoisturizer.id)) {
    amSteps.push({
      order: amOrder++,
      stepType: "MOISTURIZER",
      productId: amMoisturizer.id,
      productName: amMoisturizer.name,
      productBrand: amMoisturizer.brand,
      productImageUrl: amMoisturizer.imageUrl ?? undefined,
      targetIngredients: ["Ceramides", "Hyaluronic Acid"],
      whyChosen: `Hydrates and seals in moisture balanced for ${userProfile.skinType || "combination"} skin`,
      applicationNote: "Apply a nickel-sized amount evenly to face and neck",
    });
  }

  // AM SPF (Essential)
  const amSpf = findBestProduct(ProductCategory.SPF, undefined, selectedConcerns[0]);
  if (amSpf) {
    amSteps.push({
      order: amOrder++,
      stepType: "SPF",
      productId: amSpf.id,
      productName: amSpf.name,
      productBrand: amSpf.brand,
      productImageUrl: amSpf.imageUrl ?? undefined,
      targetIngredients: ["Broad Spectrum UV Filters"],
      whyChosen: `Critical daily photoprotection to prevent pigment darkening and UV barrier degradation`,
      applicationNote: "Apply two finger-lengths generously 15 minutes before heading outdoors",
    });
  }

  // 9. Build PM steps
  const pmSteps: RoutineStep[] = [];
  let pmOrder = 1;

  // PM Cleanser
  const pmCleanser = findBestProduct(ProductCategory.CLEANSER, undefined, selectedConcerns[0]);
  if (pmCleanser) {
    pmSteps.push({
      order: pmOrder++,
      stepType: "CLEANSER",
      productId: pmCleanser.id,
      productName: pmCleanser.name,
      productBrand: pmCleanser.brand,
      productImageUrl: pmCleanser.imageUrl ?? undefined,
      targetIngredients: ["Cleansing Base"],
      whyChosen: "Removes SPF, daily sebum, and particulate matter accumulated during the day",
      applicationNote: "Massage thoroughly over dry or damp face and rinse clean",
    });
  }

  // PM Actives (timing === 'PM' or 'BOTH')
  const pmActives = activeSelected.filter((a) => a.timing === "PM" || a.timing === "BOTH").slice(0, 2);
  for (const active of pmActives) {
    const category = active.step === "TREATMENT" ? ProductCategory.TREATMENT : ProductCategory.SERUM;
    const prod = findBestProduct(category, active.ingredient, active.forConcern);
    if (prod && !pmSteps.some((s) => s.productId === prod.id)) {
      const conflictNote = recordedConflicts.find((c) =>
        c.ingredientA.toLowerCase().includes(active.ingredient.toLowerCase()) ||
        c.ingredientB.toLowerCase().includes(active.ingredient.toLowerCase())
      );

      pmSteps.push({
        order: pmOrder++,
        stepType: active.step === "TREATMENT" ? "TREATMENT" : "SERUM",
        productId: prod.id,
        productName: prod.name,
        productBrand: prod.brand,
        productImageUrl: prod.imageUrl ?? undefined,
        targetIngredients: [active.ingredient],
        whyChosen: `Overnight treatment for ${active.forConcern.toLowerCase()} with ${active.ingredient}${active.concentration ? ` (${active.concentration})` : ""}`,
        applicationNote: conflictNote && conflictNote.resolution === "ALTERNATE_NIGHTS"
          ? `Alternate nights with other active treatments: ${conflictNote.reason}`
          : "Apply evenly to clean skin; allow 1 minute to absorb before moisturizer",
      });
    }
  }

  // PM Moisturizer
  const pmMoisturizer = findBestProduct(ProductCategory.MOISTURIZER, undefined, selectedConcerns[0]);
  if (pmMoisturizer) {
    pmSteps.push({
      order: pmOrder++,
      stepType: "MOISTURIZER",
      productId: pmMoisturizer.id,
      productName: pmMoisturizer.name,
      productBrand: pmMoisturizer.brand,
      productImageUrl: pmMoisturizer.imageUrl ?? undefined,
      targetIngredients: ["Ceramides", "Fatty Acids"],
      whyChosen: "Deep overnight barrier replenishment and trans-epidermal water loss prevention",
      applicationNote: "Smooth generously across face and neck as the final nighttime step",
    });
  }

  return {
    id: `routine-${Date.now()}`,
    scanResultId: scanResult.id || scanResult.scanId || "scan-001",
    version: 1,
    amSteps,
    pmSteps,
    conflicts: recordedConflicts.length > 0 ? recordedConflicts : undefined,
  };
}
