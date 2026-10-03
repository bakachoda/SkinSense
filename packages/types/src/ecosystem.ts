import { z } from "zod";
import { SkinType, SkinConcern } from "./enums.js";

// ──────────────────────────────────────────────
// ICD-10 Mappings & Clinical Export
// ──────────────────────────────────────────────

export const ICD10_MAP: Record<string, { code: string; label: string }> = {
  comedonal_acne: { code: "L70.0", label: "Acne vulgaris (comedonal)" },
  inflammatory_acne: { code: "L70.0", label: "Acne vulgaris (inflammatory)" },
  cystic_acne: { code: "L70.1", label: "Acne conglobata / cystic" },
  rosacea: { code: "L71.9", label: "Rosacea, unspecified" },
  erythematotelangiectatic_rosacea: { code: "L71.1", label: "Rhinophyma / erythematotelangiectatic rosacea" },
  perioral_dermatitis: { code: "L71.0", label: "Perioral dermatitis" },
  hyperpigmentation: { code: "L81.1", label: "Chloasma / melasma" },
  pih: { code: "L81.0", label: "Postinflammatory hyperpigmentation" },
  eczema: { code: "L30.9", label: "Dermatitis, unspecified" },
  seborrheic_dermatitis: { code: "L21.9", label: "Seborrheic dermatitis" },
  folliculitis: { code: "L73.9", label: "Follicular disorder, unspecified" },
  actinic_keratosis: { code: "L57.0", label: "Actinic keratosis" },
};

export interface AnnotatedFaceFinding {
  id: string;
  zone: string; // 'forehead' | 'left_cheek' | 'right_cheek' | 'nose' | 'chin' | 'periorbital'
  coordinates: { x: number; y: number };
  condition: string;
  icd10Code: string;
  icd10Label: string;
  severity: number; // 0 - 100
  clinicalGrade?: string; // GAGS or IGA grade
  dimensionsMm?: { width: number; height: number };
  safetyFlag?: "benign" | "monitor" | "urgent_evaluation";
}

export interface ClinicalExportData {
  reportId: string;
  generatedAt: string;
  patient: {
    id: string;
    age?: number;
    fitzpatrick: number;
    measuredSkinType: string;
    barrierScore: number;
    skinAge: number;
    currentMedications: string[];
    lifeStage: string;
    allergies: string[];
  };
  clinicalFindings: {
    findings: AnnotatedFaceFinding[];
    gagsScore?: number;
    igaGrade?: number;
    icd10Summary: Array<{ code: string; label: string; count: number; maxSeverity: number }>;
  };
  measurementHistory: {
    scansCount: number;
    firstScanDate: string;
    latestScanDate: string;
    overallScoreHistory: Array<{ date: string; score: number; barrier: number }>;
    concernTrends: Array<{ concern: string; direction: string; delta: number }>;
  };
  productSafetyProfile: {
    activeProductsCount: number;
    comedogenicIngredientsFound: string[];
    irritantIngredientsFound: string[];
    activeTreatments: string[];
  };
  medicationInteractions: Array<{
    medication: string;
    flaggedInteraction: string;
    confidence: "LOW" | "MEDIUM" | "HIGH";
  }>;
  environmentalContext: {
    averageUvIndex: number;
    averageAqi: number;
    waterHardness: string;
    climateZone: string;
  };
  treatmentResponses: Array<{
    ingredient: string;
    targetConcern: string;
    weeksActive: number;
    deltaScore: number;
    verdict: "EFFECTIVE" | "NO_CHANGE" | "WORSENED" | "TOO_EARLY";
  }>;
  safetyFlags: Array<{
    finding: string;
    zone: string;
    abcdeCriteria: string[];
    recommendation: string;
  }>;
}

// ──────────────────────────────────────────────
// Dermatologist Portal
// ──────────────────────────────────────────────

export interface PortalAccessLink {
  id: string;
  userId: string;
  accessToken: string;
  expiresAt: string;
  revokedAt?: string | null;
  createdAt: string;
  isActive: boolean;
  shareableUrl: string;
}

export interface DermatologistNote {
  id: string;
  userId: string;
  portalAccessId: string;
  clinicianName?: string;
  message: string;
  readAt?: string | null;
  createdAt: string;
}

export interface PhotoRequest {
  id: string;
  userId: string;
  portalAccessId: string;
  zone: string;
  reason: string;
  instructions: string;
  requestedAt: string;
  fulfilledScanId?: string | null;
}

export interface PortalPatientSummary {
  patientId: string;
  displayName: string;
  age?: number;
  fitzpatrick: number;
  skinType: string;
  barrierScore: number;
  skinAge: number;
  scanCount: number;
  latestScan?: {
    id: string;
    date: string;
    skinHealthScore: number;
    zoneScores: Record<string, Record<string, number>>;
    findings: AnnotatedFaceFinding[];
  };
  routineSummary: {
    amSteps: Array<{ stepNumber: number; category: string; productName: string }>;
    pmSteps: Array<{ stepNumber: number; category: string; productName: string }>;
  };
  medications: Array<{ name: string; dosage?: string; startDate?: string }>;
  notes: DermatologistNote[];
}

// ──────────────────────────────────────────────
// Dermatologist Feedback Loop
// ──────────────────────────────────────────────

export interface DiagnosticCorrection {
  id: string;
  userId: string;
  scanId: string;
  systemDifferential: string;
  professionalDiagnosis: string;
  prescriptions: string[];
  consentToTraining: boolean;
  createdAt: string;
}

export interface TreatmentReconciliationResult {
  prescriptionsAdded: string[];
  otcProductsRemoved: string[];
  otcProductsAdjusted: Array<{ product: string; adjustment: string }>;
  phasedIntroPaused: boolean;
  pauseDurationWeeks: number;
  reconciliationSummary: string;
}

// ──────────────────────────────────────────────
// Health App Integration (HealthKit / Health Connect)
// ──────────────────────────────────────────────

export type SleepQuality = "poor" | "fair" | "good";
export type HRVTrend = "decreasing" | "stable" | "increasing";
export type MenstrualCyclePhase = "follicular" | "ovulatory" | "luteal" | "menstrual";

export interface SleepData {
  date: string;
  durationHours: number;
  quality: SleepQuality;
}

export interface HRVData {
  date: string;
  avgMs: number;
  trend: HRVTrend;
}

export interface StepData {
  date: string;
  count: number;
}

export interface CycleData {
  currentDay: number;
  phase: MenstrualCyclePhase;
  predictedFlareRisk: "low" | "medium" | "high";
}

export interface HealthSyncPayload {
  sleep?: SleepData[];
  hrv?: HRVData[];
  steps?: StepData[];
  cycle?: CycleData;
}

export interface DerivedHealthSignals {
  avgSleepHours: number;
  sleepQualitySummary: SleepQuality;
  stressIndicator: "low" | "moderate" | "high";
  cyclePhase?: MenstrualCyclePhase;
  hormonalAcneRisk: boolean;
  suggestedScoreContext: string[];
}

// ──────────────────────────────────────────────
// Causal Inference Engine
// ──────────────────────────────────────────────

export type CausalVerdict = "LIKELY_CAUSAL" | "CORRELATED" | "UNCERTAIN";

export interface CausalAssessment {
  event: string;
  metric: string;
  verdict: CausalVerdict;
  temporalMatch: boolean;
  lagWeeks: number;
  expectedLagWeeks: { min: number; max: number };
  naturalExperimentObserved: boolean;
  confoundersDetected: string[];
  explanation: string;
}

export type EfficacyVerdict = "EFFECTIVE" | "NO_CHANGE" | "WORSENED" | "TOO_EARLY";

export interface IngredientEfficacy {
  ingredient: string;
  targetConcern: SkinConcern | string;
  startDate: string;
  startScore: number;
  currentScore: number;
  weeksActive: number;
  delta: number;
  verdict: EfficacyVerdict;
}

// ──────────────────────────────────────────────
// Life-Stage Adaptation & Medication Attribution
// ──────────────────────────────────────────────

export type LifeStage = "NONE" | "PREGNANCY" | "POSTPARTUM" | "PERIMENOPAUSE" | "PUBERTY";

export const PREGNANCY_SAFE: string[] = [
  "Azelaic Acid",
  "Niacinamide",
  "Vitamin C",
  "Hyaluronic Acid",
  "Glycerin",
  "Ceramides",
  "Centella Asiatica",
  "Zinc Oxide",
  "Titanium Dioxide",
  "Squalane",
  "Shea Butter",
  "Aloe Vera",
  "Panthenol",
  "Peptides",
];

export const PREGNANCY_BANNED: string[] = [
  "Retinol",
  "Retinaldehyde",
  "Tretinoin",
  "Adapalene",
  "Tazarotene",
  "Salicylic Acid",
  "Hydroquinone",
  "Benzoyl Peroxide",
  "Oxybenzone",
  "Avobenzone",
  "Octinoxate",
  "Formaldehyde",
];

export interface SideEffect {
  finding: string;
  confidence: "LOW" | "MEDIUM" | "HIGH";
  message: string;
}

export const MEDICATION_SIDE_EFFECTS: Record<string, SideEffect[]> = {
  corticosteroids: [
    {
      finding: "skin_thinning",
      confidence: "HIGH",
      message: "Skin thinning can occur with prolonged corticosteroid use. Consult prescribing doctor.",
    },
    {
      finding: "telangiectasia",
      confidence: "HIGH",
      message: "Visible capillaries may be related to corticosteroid use.",
    },
  ],
  lithium: [
    {
      finding: "acne_onset",
      confidence: "MEDIUM",
      message: "Acne is a documented side effect of lithium. Gentle topical management recommended.",
    },
  ],
  doxycycline: [
    {
      finding: "photosensitivity",
      confidence: "HIGH",
      message: "Oral doxycycline increases ultraviolet sensitivity. Upgrade to SPF 50+ broad-spectrum.",
    },
  ],
  isotretinoin: [
    {
      finding: "extreme_dryness",
      confidence: "HIGH",
      message: "Cheilitis and severe skin barrier dryness are expected with isotretinoin. Maximize occlusive barrier repair.",
    },
  ],
  "birth control": [
    {
      finding: "hormonal_breakout_shift",
      confidence: "MEDIUM",
      message: "Hormonal contraceptive changes require 2-3 months for cutaneous stabilization.",
    },
  ],
};

// ──────────────────────────────────────────────
// Seasonal Auto-Adjustment
// ──────────────────────────────────────────────

export type SeasonalTransitionType = "DRYING" | "HUMIDIFYING" | "UV_INCREASE" | "UV_DECREASE";

export interface SeasonalTransition {
  type: SeasonalTransitionType;
  severity: number;
  fromSeason: string;
  toSeason: string;
  title: string;
  recommendations: string[];
  routineAdjustments: {
    moisturizerWeight: "light" | "medium" | "heavy";
    spfTarget: number;
    activeFrequencyAdjustment: string;
  };
}

// ──────────────────────────────────────────────
// Voice NLP & Routine History & Multi-Profile
// ──────────────────────────────────────────────

export interface ExtractedVoiceSignals {
  productChanges: Array<{ product: string; action: "started" | "stopped" | "changed"; timeframe: string }>;
  concerns: Array<{ description: string; zone?: string; severity?: string }>;
  triggers: Array<{ trigger: string; correlation: string }>;
  timeline: Array<{ event: string; when: string }>;
  sensations: Array<{ feeling: string; zone?: string }>;
}

export interface RoutineVersionRecord {
  id: string;
  userId: string;
  routineId: string;
  version: number;
  amSteps: any;
  pmSteps: any;
  changeReason: string;
  changedAt: string;
}

export interface AppProfileData {
  id: string;
  userId: string;
  displayName: string;
  avatarUri?: string | null;
  isDefault: boolean;
  biometricLockEnabled: boolean;
  createdAt: string;
}

export type DataResidencyRegion = "US" | "EU" | "APAC";

export interface DataExportBundle {
  exportId: string;
  generatedAt: string;
  dataRegion: DataResidencyRegion;
  filesIncluded: string[];
  downloadUrl: string;
  expiresAt: string;
}
