export const SkinType = {
  OILY: "OILY",
  DRY: "DRY",
  COMBINATION: "COMBINATION",
  NORMAL: "NORMAL",
  SENSITIVE: "SENSITIVE",
} as const;
export type SkinType = (typeof SkinType)[keyof typeof SkinType];

export const ScanStatus = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
} as const;
export type ScanStatus = (typeof ScanStatus)[keyof typeof ScanStatus];

export const ProductCategory = {
  CLEANSER: "CLEANSER",
  TONER: "TONER",
  SERUM: "SERUM",
  TREATMENT: "TREATMENT",
  MOISTURIZER: "MOISTURIZER",
  SPF: "SPF",
  EYE_CREAM: "EYE_CREAM",
  MASK: "MASK",
} as const;
export type ProductCategory = (typeof ProductCategory)[keyof typeof ProductCategory];

export const SkinConcern = {
  ACNE: "ACNE",
  REDNESS: "REDNESS",
  PIGMENTATION: "PIGMENTATION",
  DRYNESS: "DRYNESS",
  FINE_LINES: "FINE_LINES",
  OILINESS: "OILINESS",
  TEXTURE: "TEXTURE",
  SENSITIVITY: "SENSITIVITY",
} as const;
export type SkinConcern = (typeof SkinConcern)[keyof typeof SkinConcern];

export const AgeRange = {
  TEENS: "TEENS",
  TWENTIES: "TWENTIES",
  THIRTIES: "THIRTIES",
  FORTIES: "FORTIES",
  FIFTIES_PLUS: "FIFTIES_PLUS",
} as const;
export type AgeRange = (typeof AgeRange)[keyof typeof AgeRange];

export const PriceTier = {
  BUDGET: "BUDGET",
  MID: "MID",
  PREMIUM: "PREMIUM",
} as const;
export type PriceTier = (typeof PriceTier)[keyof typeof PriceTier];

export const Severity = {
  MILD: "MILD",
  MODERATE: "MODERATE",
  SEVERE: "SEVERE",
} as const;
export type Severity = (typeof Severity)[keyof typeof Severity];

export const FaceZone = {
  FOREHEAD: "forehead",
  NOSE: "nose",
  LEFT_CHEEK: "left_cheek",
  RIGHT_CHEEK: "right_cheek",
  CHIN: "chin",
  PERIORBITAL: "periorbital",
} as const;
export type FaceZone = (typeof FaceZone)[keyof typeof FaceZone];

export const FindingType = {
  PAPULE: "papule",
  PUSTULE: "pustule",
  COMEDONE: "comedone",
  DARK_SPOT: "dark_spot",
  REDNESS_PATCH: "redness_patch",
  TEXTURE_ROUGH: "texture_rough",
  DRYNESS_PATCH: "dryness_patch",
} as const;
export type FindingType = (typeof FindingType)[keyof typeof FindingType];

export const RoutineStepType = {
  CLEANSER: "CLEANSER",
  TONER: "TONER",
  SERUM: "SERUM",
  TREATMENT: "TREATMENT",
  MOISTURIZER: "MOISTURIZER",
  SPF: "SPF",
  EYE_CREAM: "EYE_CREAM",
} as const;
export type RoutineStepType = (typeof RoutineStepType)[keyof typeof RoutineStepType];

export const ConflictResolution = {
  SEPARATE_AM_PM: "SEPARATE_AM_PM",
  ALTERNATE_NIGHTS: "ALTERNATE_NIGHTS",
  NEVER_SAME_ROUTINE: "NEVER_SAME_ROUTINE",
} as const;
export type ConflictResolution = (typeof ConflictResolution)[keyof typeof ConflictResolution];
