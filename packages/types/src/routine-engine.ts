import type { SkinConcern, RoutineStepType, ConflictResolution } from "./enums.js";

export interface IngredientRecommendation {
  ingredient: string;
  concentration: string | null;
  step: RoutineStepType;
  priority: number;
}

export interface ConflictRule {
  ingredientA: string;
  ingredientB: string;
  resolution: ConflictResolution;
  reason: string;
}

export const CONCERN_INGREDIENT_MAP: Record<SkinConcern, IngredientRecommendation[]> = {
  ACNE: [
    { ingredient: "Salicylic Acid", concentration: "2%", step: "TREATMENT", priority: 1 },
    { ingredient: "Niacinamide", concentration: "5-10%", step: "SERUM", priority: 2 },
    { ingredient: "Benzoyl Peroxide", concentration: "2.5%", step: "TREATMENT", priority: 3 },
  ],
  REDNESS: [
    { ingredient: "Niacinamide", concentration: "5-10%", step: "SERUM", priority: 1 },
    { ingredient: "Centella Asiatica", concentration: null, step: "SERUM", priority: 2 },
    { ingredient: "Azelaic Acid", concentration: "10%", step: "TREATMENT", priority: 3 },
  ],
  PIGMENTATION: [
    { ingredient: "Vitamin C", concentration: "10-15%", step: "SERUM", priority: 1 },
    { ingredient: "Niacinamide", concentration: "5%", step: "SERUM", priority: 2 },
    { ingredient: "Alpha Arbutin", concentration: "2%", step: "SERUM", priority: 3 },
  ],
  DRYNESS: [
    { ingredient: "Hyaluronic Acid", concentration: null, step: "SERUM", priority: 1 },
    { ingredient: "Ceramides", concentration: null, step: "MOISTURIZER", priority: 2 },
    { ingredient: "Squalane", concentration: null, step: "MOISTURIZER", priority: 3 },
  ],
  FINE_LINES: [
    { ingredient: "Retinol", concentration: "0.025-0.05%", step: "TREATMENT", priority: 1 },
    { ingredient: "Peptides", concentration: null, step: "SERUM", priority: 2 },
    { ingredient: "Vitamin C", concentration: "15%", step: "SERUM", priority: 3 },
  ],
  OILINESS: [
    { ingredient: "Niacinamide", concentration: "10%", step: "SERUM", priority: 1 },
    { ingredient: "Salicylic Acid", concentration: "0.5-2%", step: "TREATMENT", priority: 2 },
    { ingredient: "Zinc PCA", concentration: null, step: "SERUM", priority: 3 },
  ],
  TEXTURE: [
    { ingredient: "Glycolic Acid", concentration: "5-8%", step: "TREATMENT", priority: 1 },
    { ingredient: "Retinol", concentration: "0.025%", step: "TREATMENT", priority: 2 },
    { ingredient: "Niacinamide", concentration: "5%", step: "SERUM", priority: 3 },
  ],
  SENSITIVITY: [
    { ingredient: "Centella Asiatica", concentration: null, step: "SERUM", priority: 1 },
    { ingredient: "Ceramides", concentration: null, step: "MOISTURIZER", priority: 2 },
    { ingredient: "Aloe Vera", concentration: null, step: "MOISTURIZER", priority: 3 },
  ],
};

export const CONFLICT_RULES: ConflictRule[] = [
  {
    ingredientA: "Retinol",
    ingredientB: "Glycolic Acid",
    resolution: "SEPARATE_AM_PM", // Retinol PM, AHA AM
    reason: "Both are exfoliating — combined use causes irritation",
  },
  {
    ingredientA: "Retinol",
    ingredientB: "Salicylic Acid",
    resolution: "SEPARATE_AM_PM",
    reason: "Can cause excessive dryness when layered",
  },
  {
    ingredientA: "Benzoyl Peroxide",
    ingredientB: "Retinol",
    resolution: "ALTERNATE_NIGHTS",
    reason: "BP degrades retinol molecules on contact",
  },
  {
    ingredientA: "Vitamin C",
    ingredientB: "Niacinamide",
    resolution: "SEPARATE_AM_PM",
    reason: "Low-pH vitamin C may cause flushing with niacinamide (debated but cautious)",
  },
  {
    ingredientA: "Vitamin C",
    ingredientB: "Retinol",
    resolution: "SEPARATE_AM_PM",
    reason: "Different optimal pH — vitamin C AM (photoprotection), retinol PM",
  },
  {
    ingredientA: "Glycolic Acid",
    ingredientB: "Salicylic Acid",
    resolution: "NEVER_SAME_ROUTINE",
    reason: "Double acid exfoliation destroys barrier",
  },
];
