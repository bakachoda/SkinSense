import { z } from "zod";

export type FaceMapLayerType =
  | "all"
  | "oiliness"
  | "erythema"
  | "texture"
  | "uv"
  | "bacterial"
  | "surface";

export interface FindingBarycentricCoord {
  faceId: number;
  u: number;
  v: number;
  w: number;
}

export interface InteractiveFinding {
  id: string;
  zone: "forehead" | "nose" | "left_cheek" | "right_cheek" | "chin" | "periorbital";
  findingType:
    | "comedones"
    | "erythema"
    | "hyperpigmentation"
    | "dehydration"
    | "roughness"
    | "pustules";
  name: string;
  severity: number; // 0 - 100
  rootCause: string;
  activeIngredients: string[];
  expectedTimelineWeeks: number;
  trendSparkline: number[]; // last 6 - 8 readings
  meshCoordinates?: { x: number; y: number; z: number };
}

export interface ClinicalConcernDetail {
  concern: string;
  zone: string;
  severityScore: number;
  clinicalObservation: string;
  rootCauseExplanation: string;
  targetedByProducts: string[];
}

export interface PhasedMilestone {
  week: number;
  milestone: string;
  expectedBiomarkerChange: string;
}

export interface ConfidenceEvidentiaryNote {
  biomarker: string;
  confidenceScore: number;
  evidentiaryCitation: string;
}

export interface ClinicalReport {
  id: string;
  scanId: string;
  userId: string;
  createdAt: string;
  summary: string;
  overallScore: number;
  scoreDelta: number;
  scoreBreakdown: {
    hydration: number;
    barrierHealth: number;
    oilBalance: number;
    inflammation: number;
    pigmentation: number;
    texture: number;
    microbiome: number;
  };
  keyConcerns: ClinicalConcernDetail[];
  routineRationale: string;
  phasedPlan: PhasedMilestone[];
  confidenceNotes: ConfidenceEvidentiaryNote[];
  audioSummaryScript: string;
  verificationPassed: boolean;
  hallucinationFlags: string[];
}

export type NotificationType =
  | "routine_reminder"
  | "weather_alert"
  | "encouragement"
  | "restock_alert"
  | "weekly_digest";

export interface SmartNotification {
  id: string;
  userId: string;
  type: NotificationType;
  priority: number; // 0 - 100
  title: string;
  body: string;
  actionUrl?: string;
  scheduledFor: string;
  sentAt?: string;
  readAt?: string;
  metadata?: Record<string, any>;
}

export interface SmartNotificationPreferences {
  userId: string;
  routineReminders: boolean;
  weatherAlerts: boolean;
  encouragement: boolean;
  restockAlerts: boolean;
  quietMode: boolean;
  preferredAmTime: string; // e.g. "08:00"
  preferredPmTime: string; // e.g. "21:30"
}

export interface SkinDiaryEntry {
  id: string;
  userId: string;
  scanId?: string;
  createdAt: string;
  note: string;
  tags: string[]; // e.g. ["stress", "poorSleep", "ateDairy", "newProduct"]
  photos: string[];
  promptedAnswers?: {
    skinFeel: number; // 0 = dry, 50 = balanced, 100 = oily
    irritation: boolean;
  };
}

export interface TimelineMarker {
  id: string;
  userId: string;
  createdAt: string;
  label: string;
  type: "product" | "lifestyle" | "medical";
}

export interface WeeklyDigestSummary {
  weekStart: string;
  weekEnd: string;
  currentScore: number;
  scoreDelta: number;
  adherencePercent: number;
  completedRoutines: number;
  targetRoutines: number;
  topImprovement: string;
  keyFocusNextWeek: string;
}

export interface RoutineCardStep {
  step: number;
  name: string;
  category: string;
  amount: string;
  waitTimeMinutes: number;
}

export interface PrintableRoutineCardData {
  userName: string;
  generatedDate: string;
  amSteps: RoutineCardStep[];
  pmSteps: RoutineCardStep[];
  weeklyChecklistDays: string[];
  verificationQrPayload: string;
}

// Zod schemas for runtime validation
export const CreateDiaryEntrySchema = z.object({
  scanId: z.string().optional(),
  note: z.string().min(1).max(2000),
  tags: z.array(z.string()).default([]),
  photos: z.array(z.string()).default([]),
  promptedAnswers: z
    .object({
      skinFeel: z.number().min(0).max(100),
      irritation: z.boolean(),
    })
    .optional(),
});
export type CreateDiaryEntryInput = z.infer<typeof CreateDiaryEntrySchema>;

export const UpdateNotificationPrefsSchema = z.object({
  routineReminders: z.boolean().optional(),
  weatherAlerts: z.boolean().optional(),
  encouragement: z.boolean().optional(),
  restockAlerts: z.boolean().optional(),
  quietMode: z.boolean().optional(),
  preferredAmTime: z.string().optional(),
  preferredPmTime: z.string().optional(),
});
export type UpdateNotificationPrefsInput = z.infer<typeof UpdateNotificationPrefsSchema>;
