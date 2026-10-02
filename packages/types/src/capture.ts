import { z } from "zod";
import { FaceZoneSchema, type FaceZoneType, type Finding } from "./schemas.js";

// ──────────────────────────────────────────────
// Capture Modes & Poses (Phase 3, Sections 1 & 2)
// ──────────────────────────────────────────────

export const CaptureModeSchema = z.enum([
  "audio_guided",
  "mirror",
  "assisted",
  "front_camera",
]);
export type CaptureMode = z.infer<typeof CaptureModeSchema>;

export const GuidanceTypeSchema = z.enum(["audio_haptic", "visual", "both"]);
export type GuidanceType = z.infer<typeof GuidanceTypeSchema>;

export const PoseTargetSchema = z.enum(["frontal", "left_45", "right_45"]);
export type PoseTarget = z.infer<typeof PoseTargetSchema>;

export const HeadPoseSchema = z.object({
  yaw: z.number(), // degrees: 0 = center, -45 = left, +45 = right
  pitch: z.number(), // degrees: tilt up/down
  roll: z.number(), // degrees: tilt side to side
});
export type HeadPose = z.infer<typeof HeadPoseSchema>;

export const CaptureConfigSchema = z.object({
  targetPoses: z.array(HeadPoseSchema),
  framesPerPose: z.number().default(5), // 3 HDR + 2 flash
  videoClipDuration: z.number().default(2), // 2 seconds
  stabilityThreshold: z.number().default(0.15),
});
export type CaptureConfig = z.infer<typeof CaptureConfigSchema>;

export interface CapturedFrame {
  uri: string;
  pose: PoseTarget;
  exposureEv: number; // -1, 0, 1
  flash: boolean;
  timestamp: number;
  isCalibration?: boolean;
}

export interface ICaptureMode {
  readonly id: CaptureMode;
  readonly camera: "back" | "front";
  readonly guidanceType: GuidanceType;

  startCapture(config: CaptureConfig): Promise<void>;
  onPoseReady(callback: (pose: HeadPose) => void): { unsubscribe: () => void };
  captureFrame(): Promise<CapturedFrame>;
  stopCapture(): Promise<void>;
}

// ──────────────────────────────────────────────
// Frame Scoring (Phase 3, Section 3)
// ──────────────────────────────────────────────

export const FrameScoreSchema = z.object({
  sharpness: z.number(), // Laplacian variance (higher = sharper)
  stability: z.number(), // Inverse of landmark displacement
  exposure: z.number(), // Histogram spread (0-1)
  eyeOpen: z.boolean(), // Eye-aspect-ratio > 0.2
});
export type FrameScore = z.infer<typeof FrameScoreSchema>;

export interface ScoredFrame {
  frame: CapturedFrame;
  score: FrameScore;
}

// ──────────────────────────────────────────────
// Environment Quality Gate (Phase 3, Section 7)
// ──────────────────────────────────────────────

export const EnvironmentQualityScoreSchema = z.enum(["green", "yellow", "red"]);
export type EnvironmentQualityScore = z.infer<typeof EnvironmentQualityScoreSchema>;

export const EnvironmentQualitySchema = z.object({
  score: EnvironmentQualityScoreSchema,
  lightTempK: z.number().optional(), // daylight ~5500K, fluorescent ~4000K, incandescent ~2700K
  shadowMagnitude: z.number().optional(),
  dominantDirection: z
    .enum(["overhead", "left", "right", "backlit", "front"])
    .optional(),
  advice: z.string().optional(),
});
export type EnvironmentQuality = z.infer<typeof EnvironmentQualitySchema>;

// ──────────────────────────────────────────────
// Physiological State (Phase 3, Section 8)
// ──────────────────────────────────────────────

export const PhysiologicalStateSchema = z.object({
  exercised: z.boolean(),
  hotShower: z.boolean(),
});
export type PhysiologicalState = z.infer<typeof PhysiologicalStateSchema>;

// ──────────────────────────────────────────────
// Self-Assessment & Spot Marker (Phase 3, Section 9)
// ──────────────────────────────────────────────

export const SpotMarkerSchema = z.object({
  id: z.string().optional(),
  x: z.number().min(0).max(1), // normalized 0-1
  y: z.number().min(0).max(1), // normalized 0-1
  zone: FaceZoneSchema,
  userNote: z.string().optional(),
});
export type SpotMarker = z.infer<typeof SpotMarkerSchema>;

export const UserSelectionSchema = z.object({
  zone: FaceZoneSchema,
  concerns: z.array(z.string()),
});
export type UserSelection = z.infer<typeof UserSelectionSchema>;

export const SelfAssessmentSchema = z.object({
  id: z.string().optional(),
  scanId: z.string(),
  selections: z.array(UserSelectionSchema),
  spotMarkers: z.array(SpotMarkerSchema),
  createdAt: z.string().datetime().optional(),
});
export type SelfAssessment = z.infer<typeof SelfAssessmentSchema>;

export const CreateSelfAssessmentSchema = z.object({
  selections: z.array(UserSelectionSchema),
  spotMarkers: z.array(SpotMarkerSchema),
});
export type CreateSelfAssessment = z.infer<typeof CreateSelfAssessmentSchema>;

// ──────────────────────────────────────────────
// Calibrated Findings (Phase 3, Section 9.4)
// ──────────────────────────────────────────────

export const CalibratedConfidenceSchema = z.enum(["HIGH", "MODERATE", "LOW"]);
export type CalibratedConfidence = z.infer<typeof CalibratedConfidenceSchema>;

export const FindingSourceSchema = z.enum(["ai_and_user", "ai_only", "user_only"]);
export type FindingSource = z.infer<typeof FindingSourceSchema>;

export interface CalibratedFinding extends Finding {
  calibratedConfidence?: CalibratedConfidence;
  source?: FindingSource;
  label?: string;
  reanalyze?: boolean;
}

// ──────────────────────────────────────────────
// Preprocessing & Progress Metrics (Phase 3, Section 10 & 13)
// ──────────────────────────────────────────────

export type OilinessMap = Record<FaceZoneType, number>;
export type ZoneCoverageMap = Record<FaceZoneType, number>;

export interface PreprocessedComposite {
  oiliness: OilinessMap;
  scaleFactorMm: number; // pixels per mm at face distance
  zoneCoverage: ZoneCoverageMap;
  anglesProcessed: number;
}
