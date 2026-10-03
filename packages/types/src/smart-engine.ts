import type { SkinConcern, ProductCategory, SkinType } from "./enums.js";

// ==========================================
// 1. Fitzpatrick Skin Tone
// ==========================================
export type FitzpatrickType = 1 | 2 | 3 | 4 | 5 | 6;

export interface FitzpatrickResult {
  category: FitzpatrickType;
  lMean: number;
  chromaticityA: number;
  chromaticityB: number;
  confidence: number;
}

// ==========================================
// 2. Data-Driven Skin Type Reclassification
// ==========================================
export interface MeasuredSkinProfile {
  oiliness: number; // 0-100 from specular map
  hydration: number; // 0-100 from texture dehydration analysis
  sensitivity: number; // 0-100 barrier score + reaction
  measuredType: "OILY" | "DRY" | "COMBINATION" | "NORMAL" | "DEHYDRATED_OILY";
  selfReportedType: SkinType;
  discrepancy: boolean;
  explanation?: string;
  seasonalDrift?: {
    previousType: string;
    shiftReason: string;
  };
}

// ==========================================
// 3. Ensemble Model Consensus
// ==========================================
export type ConsensusConfidence = "HIGH" | "MEDIUM" | "LOW" | "NONE";

export interface ModelDetectionVote {
  modelName: string; // e.g. "YOLOv8-nano", "EfficientDet-D0", "U-Net"
  detected: boolean;
  confidence: number;
  category: string;
}

export interface EnsembleConsensusResult {
  category: string;
  zone: string;
  agreements: number; // 0 to 3
  consensusConfidence: ConsensusConfidence;
  isConfirmed: boolean;
  modelVotes: ModelDetectionVote[];
}

// ==========================================
// 4. Cross-Zone Differential Diagnosis
// ==========================================
export interface RankedDifferential {
  condition: string;
  patternType: "sebaceous_acne" | "hormonal_acne" | "rosacea" | "external_irritation" | "fungal_folliculitis" | "perioral_dermatitis" | "other";
  confidence: number;
  treatment: string;
  note?: string;
  requiresDermatologistReferral?: boolean;
  followUpQuestion?: string;
}

export interface DifferentialDiagnosisResult {
  primary: RankedDifferential;
  alternatives: RankedDifferential[];
  spatialDistribution: string;
}

// ==========================================
// 5. Scar Type Classification
// ==========================================
export type ScarType = "ICE_PICK" | "BOXCAR" | "ROLLING" | "HYPERTROPHIC_KELOID" | "PIE" | "PIH";

export interface ScarFinding {
  type: ScarType;
  zone: string;
  depthMm: number;
  isSurfaceOnly: boolean;
  treatment: string;
  routing: "DERMATOLOGIST_REFERRAL" | "TOPICAL_PIPELINE";
  referralNote?: string;
}

// ==========================================
// 6. Suspicious Lesion Safety Screening (ABCDE)
// ==========================================
export type SafetyLevel = "NORMAL" | "MONITOR" | "RECOMMEND_CHECKUP";

export interface ABCDEScore {
  asymmetry: number; // 0-1
  borderIrregularity: number; // 0-1
  colorVariance: number; // 0-1
  diameterMm: number;
  evolutionDetected: boolean;
  totalFlagCount: number;
}

export interface SafetyScreeningResult {
  level: SafetyLevel;
  lesionId?: string;
  zone?: string;
  abcde: ABCDEScore;
  clinicalMessage: string;
  requiresPhysicianReferral: boolean;
}

// ==========================================
// 7. Barrier Health Composite Score
// ==========================================
export interface BarrierInputs {
  dehydrationTexture: number; // 0-100 (from high-frequency wavelet variance)
  oilDehydrationRatio: number; // 0-100
  sensitivityReport: number; // 0-100 from quiz
  waterHardness: number; // 0-100 ppm severity
  productStrippingRisk: number; // 0-100
  weatherStress: number; // 0-100
  rPPGIrritation?: number;
}

export interface BarrierHealthResult {
  score: number; // 0-100 (0=destroyed, 100=perfect)
  status: "COMPROMISED" | "VULNERABLE" | "HEALTHY" | "OPTIMAL";
  isLockedOut: boolean; // true if score < 40
  lockoutReason?: string;
  allowedCategories: ProductCategory[];
  restrictedIngredients: string[];
  consecutiveHealthyScans: number;
}

// ==========================================
// 8. Skin Age / Biological Aging
// ==========================================
export interface SkinAgeResult {
  biologicalAge: number;
  chronologicalAge: number;
  delta: number; // biologicalAge - chronologicalAge
  zoneAges: Record<string, number>;
  primaryContributingFactors: {
    factor: "fineLines" | "poreVisibility" | "pigmentationIrregularity" | "textureRoughness";
    impact: string;
  }[];
}

// ==========================================
// 9. Treatment Dependency Graph
// ==========================================
export enum TreatmentPhase {
  BARRIER_REPAIR = 0,
  ANTI_INFLAMMATION = 1,
  POST_INFLAMMATORY = 2,
  TEXTURE_AGING = 3,
  MAINTENANCE = 4,
}

export interface TreatmentPhaseStatus {
  currentPhase: TreatmentPhase;
  phaseName: string;
  description: string;
  lockedTreatments: string[];
  unlockedTreatments: string[];
  unlockCriteria: string;
}

// ==========================================
// 10. Standardized Clinical Grading (GAGS & IGA)
// ==========================================
export interface ClinicalGradingResult {
  gagsScore: number; // 1-44
  gagsSeverity: "Mild" | "Moderate" | "Severe" | "Very Severe";
  igaScore: number; // 0-4 (0=Clear, 1=Almost Clear, 2=Mild, 3=Moderate, 4=Severe)
  igaLabel: string;
}

// ==========================================
// 11. Result Self-Audit & Quality Assurance
// ==========================================
export interface AuditIssue {
  type: "SCORE_JUMP" | "CROSS_SIGNAL" | "HYSTERESIS_HOLD";
  zone?: string;
  concern?: string;
  delta?: number;
  note: string;
  action: string;
}

export interface SelfAuditResult {
  issues: AuditIssue[];
  confidence: "HIGH" | "REDUCED";
  passed: boolean;
}

// ==========================================
// 12. User Products & Conflict Engine
// ==========================================
export interface UserProduct {
  id: string;
  userId: string;
  name: string;
  brand: string;
  category: ProductCategory;
  ingredients: string[];
  activeIngredients: { name: string; concentration?: string }[];
  routineSlot: "AM" | "PM" | "BOTH";
  stepOrder: number;
  scannedVia: "barcode" | "ocr" | "manual";
  addedDate: string;
}

export interface ProductConflictWarning {
  productA: string;
  productB: string;
  ingredientA: string;
  ingredientB: string;
  resolution: string;
  severity: "CRITICAL" | "MODERATE" | "CAUTION";
  explanation: string;
}

export interface ComedogenicityAlert {
  productName: string;
  ingredient: string;
  comedogenicityRating: number; // 0-5
  correlatedZone: string;
  recommendation: string;
}

// ==========================================
// 13. Medication & History
// ==========================================
export interface MedicationRecord {
  id: string;
  userId: string;
  name: string;
  restriction: "MINIMAL_ROUTINE" | "NO_OTC_RETINOL" | "NOTE_PHOTOSENSITIVITY" | "MONITOR_THINNING" | "NONE";
  note: string;
  startDate: string;
  isActive: boolean;
}

// ==========================================
// 14. Phased Introduction Protocol
// ==========================================
export interface IntroductionPhaseItem {
  phase: number;
  weekRange: [number, number];
  title: string;
  products: {
    name: string;
    brand: string;
    category: ProductCategory;
    frequency: string;
    concentration?: string;
  }[];
  checkpoint: string;
}

export interface PhasedIntroductionPlan {
  phases: IntroductionPhaseItem[];
  currentWeek: number;
}

export type WorseningClassification = "PURGING" | "ADVERSE_REACTION" | "UNCLEAR";

export interface ReactionAssessment {
  classification: WorseningClassification;
  explanation: string;
  affectedZones: string[];
  actionRecommendation: string;
}

// ==========================================
// 15. Ingredient Synergy Optimization
// ==========================================
export interface IngredientSynergyPair {
  ingredients: string[];
  effect: string;
  clinicalRationale: string;
  priorityBoost: number;
}

// ==========================================
// 16. Routine Complexity Modes
// ==========================================
export type RoutineTier = "ESSENTIAL" | "STANDARD" | "COMPREHENSIVE";

// ==========================================
// 17. Routine Calendar
// ==========================================
export interface CalendarDaySchedule {
  dayOfWeek: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  amSteps: { stepOrder: number; productName: string; category: ProductCategory; notes?: string }[];
  pmSteps: { stepOrder: number; productName: string; category: ProductCategory; notes?: string }[];
  notes?: string;
  isRestNight?: boolean;
}

export interface RoutineCalendar {
  schedule: CalendarDaySchedule[];
  circadianNote?: string;
}

// ==========================================
// 18. Environmental Context
// ==========================================
export interface EnvironmentalContext {
  uvIndex: number;
  uvAccumulation14Day: number;
  aqi: number;
  pm25: number;
  waterHardnessPpm: number;
  humidityPct: number;
  humidity7DayHistory: number[];
  temperatureSwingC: number;
  pollenCount: number;
  season: "winter" | "spring" | "summer" | "fall";
  advisoryNote?: string;
}

// ==========================================
// 19. Adaptive Re-Scan Scheduling
// ==========================================
export interface AdaptiveScanSchedule {
  nextScanDate: string; // ISO format
  daysRemaining: number;
  reason: string;
  urgency: "LOW" | "MEDIUM" | "HIGH";
}
