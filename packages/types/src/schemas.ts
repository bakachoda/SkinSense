import { z } from "zod";

// ──────────────────────────────────────────────
// Questionnaire Schemas (Phase 1, Section 2.3)
// ──────────────────────────────────────────────

export const SkinTypeSchema = z.enum(["OILY", "DRY", "COMBINATION", "NORMAL", "SENSITIVE"]);
export type SkinTypeType = z.infer<typeof SkinTypeSchema>;

export const SkinConcernSchema = z.enum([
  "ACNE",
  "REDNESS",
  "PIGMENTATION",
  "DRYNESS",
  "FINE_LINES",
  "OILINESS",
  "TEXTURE",
  "SENSITIVITY",
]);
export type SkinConcernType = z.infer<typeof SkinConcernSchema>;

export const AgeRangeSchema = z.enum(["TEENS", "TWENTIES", "THIRTIES", "FORTIES", "FIFTIES_PLUS"]);
export type AgeRangeType = z.infer<typeof AgeRangeSchema>;

export const QuestionnaireSchema = z.object({
  skinType: SkinTypeSchema,
  concerns: z.array(SkinConcernSchema).min(1).max(3),
  allergies: z.array(z.string()),
  ageRange: AgeRangeSchema,
  isPregnant: z.boolean(),
});
export type Questionnaire = z.infer<typeof QuestionnaireSchema>;

// ──────────────────────────────────────────────
// Finding & ZoneScore (Phase 1, Section 3.4)
// ──────────────────────────────────────────────

export const FaceZoneSchema = z.enum([
  "forehead",
  "nose",
  "left_cheek",
  "right_cheek",
  "chin",
  "periorbital",
]);
export type FaceZoneType = z.infer<typeof FaceZoneSchema>;

export const FindingTypeSchema = z.enum([
  "papule",
  "pustule",
  "comedone",
  "dark_spot",
  "redness_patch",
  "texture_rough",
  "dryness_patch",
]);

export const FindingSchema = z.object({
  id: z.string(),
  type: FindingTypeSchema,
  zone: FaceZoneSchema,
  severity: z.number().min(0).max(100),
  confidence: z.number().min(0).max(1),
  boundingBox: z
    .object({
      x: z.number(),
      y: z.number(),
      w: z.number(),
      h: z.number(),
    })
    .optional(),
  description: z.string().optional(),
});
export type Finding = z.infer<typeof FindingSchema>;

export const ZoneScoreSchema = z.object({
  acne: z.number().min(0).max(100),
  redness: z.number().min(0).max(100),
  pigmentation: z.number().min(0).max(100),
  texture: z.number().min(0).max(100),
  dryness: z.number().min(0).max(100),
  oiliness: z.number().min(0).max(100),
});
export type ZoneScore = z.infer<typeof ZoneScoreSchema>;

// ──────────────────────────────────────────────
// ScanResult (Phase 1, Section 3.4)
// ──────────────────────────────────────────────

export const ScanResultMetadataSchema = z
  .object({
    modelVersion: z.string(),
    processingTimeMs: z.number(),
    imageQualityScore: z.number().optional(),
    blurVariance: z.number().optional(),
    exposureCheckPassed: z.boolean().optional(),
  })
  .passthrough();

export const ScanResultSchema = z.object({
  id: z.string().optional(),
  scanId: z.string().optional(),
  version: z.number().default(1),
  skinHealthScore: z.number().min(0).max(100),
  zoneScores: z.record(z.string(), ZoneScoreSchema),
  findings: z.array(FindingSchema),
  metadata: ScanResultMetadataSchema.default({
    modelVersion: "v1.0",
    processingTimeMs: 0,
  }),
  createdAt: z.string().datetime().optional(),
});
export type ScanResult = z.infer<typeof ScanResultSchema>;

// ──────────────────────────────────────────────
// Routine Schemas (Phase 1, Section 4.5)
// ──────────────────────────────────────────────

export const RoutineStepTypeSchema = z.enum([
  "CLEANSER",
  "TONER",
  "SERUM",
  "TREATMENT",
  "MOISTURIZER",
  "SPF",
  "EYE_CREAM",
]);

export const RoutineStepSchema = z.object({
  order: z.number().int().positive(),
  stepType: RoutineStepTypeSchema,
  productId: z.string(),
  productName: z.string(),
  productBrand: z.string(),
  productImageUrl: z.string().optional(),
  targetIngredients: z.array(z.string()),
  whyChosen: z.string(),
  applicationNote: z.string().optional(),
});
export type RoutineStep = z.infer<typeof RoutineStepSchema>;

export const ConflictSchema = z.object({
  ingredientA: z.string(),
  ingredientB: z.string(),
  resolution: z.string(),
  reason: z.string().optional(),
});
export type Conflict = z.infer<typeof ConflictSchema>;

export const RoutineSchema = z.object({
  id: z.string(),
  scanResultId: z.string(),
  version: z.number().default(1),
  amSteps: z.array(RoutineStepSchema),
  pmSteps: z.array(RoutineStepSchema),
  conflicts: z.array(ConflictSchema).optional(),
});
export type Routine = z.infer<typeof RoutineSchema>;

// ──────────────────────────────────────────────
// Product Schemas (Phase 1, Section 5.2)
// ──────────────────────────────────────────────

export const PriceTierSchema = z.enum(["BUDGET", "MID", "PREMIUM"]);
export type PriceTierType = z.infer<typeof PriceTierSchema>;

export const ProductCategorySchema = z.enum([
  "CLEANSER",
  "TONER",
  "SERUM",
  "TREATMENT",
  "MOISTURIZER",
  "SPF",
  "EYE_CREAM",
  "MASK",
]);
export type ProductCategoryType = z.infer<typeof ProductCategorySchema>;

export const ProductCardSchema = z.object({
  id: z.string(),
  name: z.string(),
  brand: z.string(),
  category: ProductCategorySchema,
  skinTypes: z.array(SkinTypeSchema),
  concerns: z.array(SkinConcernSchema),
  priceTier: PriceTierSchema,
  imageUrl: z.string().url().nullable().optional(),
  purchaseUrl: z.string().url().nullable().optional(),
  ingredients: z.array(z.string()),
  activeIngredients: z.array(
    z.object({
      name: z.string(),
      concentration: z.string().nullable().optional(),
    }),
  ),
});
export type ProductCard = z.infer<typeof ProductCardSchema>;

export const ProductFilterSchema = z.object({
  skinType: SkinTypeSchema.optional(),
  concerns: z.array(SkinConcernSchema).optional(),
  priceTier: PriceTierSchema.optional(),
  category: ProductCategorySchema.optional(),
  excludeIngredients: z.array(z.string()).optional(),
  search: z.string().optional(),
  limit: z.coerce.number().default(20),
  offset: z.coerce.number().default(0),
});
export type ProductFilter = z.infer<typeof ProductFilterSchema>;

// ──────────────────────────────────────────────
// Scan Creation & Job Dispatch (Phase 1, Section 3.1)
// ──────────────────────────────────────────────

export const CreateScanRequestSchema = z.object({
  imageKey: z.string().optional(),
  imageKeys: z.array(z.string()).optional(),
  questionnaire: QuestionnaireSchema,
});
export type CreateScanRequest = z.infer<typeof CreateScanRequestSchema>;

export const CreateScanSchema = CreateScanRequestSchema;
export type CreateScan = z.infer<typeof CreateScanSchema>;

export const CreateScanResponseSchema = z.object({
  scanId: z.string(),
  status: z.literal("PENDING"),
});
export type CreateScanResponse = z.infer<typeof CreateScanResponseSchema>;

export const ScanJobPayloadSchema = z.object({
  scanId: z.string(),
  userId: z.string(),
  imageKey: z.string(),
  questionnaire: QuestionnaireSchema,
  modelVersion: z.string().default("v1.0"),
});
export type ScanJobPayload = z.infer<typeof ScanJobPayloadSchema>;

// ──────────────────────────────────────────────
// User Profile (Phase 1, Section 8.5)
// ──────────────────────────────────────────────

export const UserProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  skinType: SkinTypeSchema.nullable().optional(),
  concerns: z.array(SkinConcernSchema).optional(),
  ageRange: AgeRangeSchema.nullable().optional(),
  fitzpatrick: z.number().int().min(1).max(6).nullable().optional(),
  birthYear: z.number().int().min(1920).max(2015).nullable().optional(),
  allergies: z.array(z.string()),
  isPregnant: z.boolean(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

export const UpdateProfileSchema = QuestionnaireSchema.partial();
export type UpdateProfile = z.infer<typeof UpdateProfileSchema>;

// ──────────────────────────────────────────────
// Presigned Upload (Phase 1, Section 8.1)
// ──────────────────────────────────────────────

export const PresignedUploadRequestSchema = z.object({
  contentType: z.literal("image/jpeg").default("image/jpeg"),
  fileSize: z.number().max(5 * 1024 * 1024, "File size exceeds 5MB limit"),
});
export type PresignedUploadRequest = z.infer<typeof PresignedUploadRequestSchema>;

export const PresignedUploadResponseSchema = z.object({
  uploadUrl: z.string().url(),
  key: z.string(),
  expiresAt: z.string().datetime(),
});
export type PresignedUploadResponse = z.infer<typeof PresignedUploadResponseSchema>;

// ──────────────────────────────────────────────
// Adherence (Phase 1, Section 8.6)
// ──────────────────────────────────────────────

export const CreateAdherenceLogSchema = z.object({
  routineId: z.string(),
  date: z.string(),
  amCompleted: z.boolean(),
  pmCompleted: z.boolean(),
});
export type CreateAdherenceLog = z.infer<typeof CreateAdherenceLogSchema>;

// ──────────────────────────────────────────────
// Error Envelope
// ──────────────────────────────────────────────

export const ApiErrorSchema = z.object({
  statusCode: z.number().int(),
  message: z.string(),
  details: z.unknown().optional(),
  timestamp: z.string().datetime(),
  path: z.string(),
  requestId: z.string().uuid(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;
