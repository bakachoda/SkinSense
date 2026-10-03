import { z } from "zod";

// ==========================================
// 1. Device Capabilities & Hardware Tiers
// ==========================================

export type HardwareTier = "TIER_1_FLAGSHIP" | "TIER_2_MIDRANGE" | "TIER_3_BUDGET";

export interface DeviceResolution {
  width: number;
  height: number;
}

export interface DeviceCapabilities {
  // Camera sensors
  hasRAW: boolean;
  hasLiDAR: boolean;
  hasTrueDepth: boolean;
  hasMacro: boolean;
  hasTelephoto: boolean;
  hasUltrawide: boolean;
  hasMultiCam: boolean;

  // Video capabilities
  has240fps: boolean;
  has120fps: boolean;
  has60fps: boolean;

  // Stabilization
  hasOIS: boolean;
  hasEIS: boolean;

  // Resolution
  maxPhotoResolution: DeviceResolution;
  maxVideoResolution: DeviceResolution;
  nativeSensorResolution: DeviceResolution;

  // Auxiliary Sensors
  hasGyroscope: boolean;
  hasAccelerometer: boolean;
  hasBarometer: boolean;

  // ML acceleration
  hasNeuralEngine: boolean; // iOS Apple Neural Engine
  hasNNAPI: boolean; // Android Neural Networks API
  coreMLVersion?: string;
  tfLiteVersion?: string;

  // Display & Optics
  maxDisplayBrightness: number; // in nits
  supportsWideColor: boolean; // P3 gamut

  // Computed classification tier
  hardwareTier: HardwareTier;
}

// ==========================================
// 2. Device Camera Calibration & Profile
// ==========================================

export interface DeviceProfile {
  id?: string;
  deviceId: string;
  userId?: string;
  osType: "ios" | "android";
  osVersion: string;
  deviceModel?: string;

  capabilities: DeviceCapabilities;

  // Color calibration
  whiteBalanceMatrix: number[][]; // 3x3 transformation matrix
  colorAccuracyDeltaE: number; // Average error vs standard reference

  // Sensor noise characteristics
  noiseFloorRGB: [number, number, number]; // Per-channel noise at ISO 100
  readNoiseElectrons?: number;
  darkCurrentRate?: number; // e-/pixel/sec

  // Optical properties
  geometricDistortion?: number[]; // Polynomial radial distortion coefficients
  chromaticAberration?: number; // Edge color dispersion pixels
  vignettingProfile?: number[][]; // 2D falloff map

  // Dynamic range
  dynamicRangeStops: number; // EV stops
  clippingThreshold?: number; // 0-255 sensor ceiling

  // Thermal & Battery characteristics
  thermalThrottleTemp?: number; // Celsius
  batteryDrainRate?: number; // mAh/minute of continuous camera session

  calibrationDate: string;
  calibrationLightingLux: number;
}

// ==========================================
// 3. Advanced Capture Modes
// ==========================================

export type AdvancedCaptureMode =
  | "standard"
  | "raw"
  | "lidar"
  | "multispectral"
  | "photometric_stereo"
  | "elasticity_240fps"
  | "macro";

// Gyroscope orientation sample for Photometric Stereo
export interface GyroOrientationSample {
  timestamp: number;
  roll: number;
  pitch: number;
  yaw: number;
}

// ==========================================
// 4. LiDAR / 3D Topology Analysis
// ==========================================

export type TopologyClassification = "raised" | "flat" | "depressed";

export interface PoreAnalysisResult {
  averageDepthMm: number;
  maxDepthMm: number;
  congestionScore: number; // 0-10 scale
  poreCount: number;
}

export interface LesionTopologyResult {
  classification: TopologyClassification;
  lesionHeightMm: number; // max elevation / depression relative to surrounding baseline
  surroundingPlaneNormal: [number, number, number];
  poreAnalysis: PoreAnalysisResult;
  confidence: number;
}

// ==========================================
// 5. Photometric Stereo Normal & Albedo
// ==========================================

export interface PhotometricStereoResult {
  meanNormalDeviation: number; // Surface roughness / micro-relief indicator
  albedoContrast: number;
  microTextureScore: number; // 0-100
  earlyPapulesCount: number; // Subclinical bumps before redness
  shallowScarDepthEstimateMm: number;
}

// ==========================================
// 6. rPPG Blood Flow & Perfusion
// ==========================================

export type InflammationStatus = "active" | "resolved" | "none";

export interface RppgPerfusionResult {
  perfusionScore: number; // SNR in dB
  peakBpm: number; // Heart rate detected via facial green reflectance
  inflammationStatus: InflammationStatus;
  capillaryDilationIndex: number; // 0-10 scale
  isVascularRosaceaPattern: boolean;
  subclinicalInflammationDetected: boolean;
}

// ==========================================
// 7. 240fps Elasticity & Viscoelastic Recovery
// ==========================================

export type ElasticityGrade = "excellent" | "good" | "fair" | "poor";

export interface ZoneElasticityMetric {
  tauMs: number; // Time constant of exponential snapback recovery
  peakDisplacementMm: number; // Max stretch amplitude
  grade: ElasticityGrade;
}

export interface ElasticityAnalysisResult {
  overallGrade: ElasticityGrade;
  recoveryTimeMs: number; // Average tau across zones
  firmnessScore: number; // 0-10 score
  zoneMetrics: {
    forehead: ZoneElasticityMetric;
    cheeks: ZoneElasticityMetric;
    underEye: ZoneElasticityMetric;
  };
}

// ==========================================
// 8. Multispectral Screen Flash Analysis
// ==========================================

export interface MultispectralResult {
  redVascularSignal: number; // 625nm subsurface vascular reflection
  greenHemoglobinSignal: number; // 530nm peak hemoglobin absorption
  blueMelaninSignal: number; // 470nm epidermal melanin contrast
  violetBacteriaSignal: number; // 410nm P. acnes porphyrin fluorescence
  bacteriaLevel: number; // 0-10 scale
  depolarizationRatio: number; // Specular oiliness vs surface scattering
  activeErythemaMapScore: number;
}

// ==========================================
// 9. On-Device ML Feedback
// ==========================================

export interface MakeupDetectionResult {
  detected: boolean;
  regions: Array<{
    type: "foundation" | "blush" | "eyeshadow" | "powder";
    confidence: number;
  }>;
  confidence: number;
}

export interface OnDeviceMLScreeningResult {
  hasMakeup: boolean;
  makeupRegions: string[];
  hairCoveragePercent: number;
  illuminationQuality: "optimal" | "harsh_shadows" | "overexposed" | "underexposed";
  estimatedFitzpatrick: number;
}

// ==========================================
// 10. Predictive Analytics
// ==========================================

export type PredictionType = "breakout" | "sun_damage" | "dehydration";
export type RiskLevel = "low" | "medium" | "high";

export interface BreakoutPrediction {
  type: "breakout";
  riskLevel: RiskLevel;
  confidence: number;
  timeframe: string; // e.g. "24-48 hours"
  recommendation: string;
  triggerFactors: string[];
}

export interface SunDamageTrajectory {
  type: "sun_damage";
  currentAge: number;
  currentScore: number;
  projectedAge50: number;
  projectedAge60: number;
  projectedAge70: number;
  riskLevel: RiskLevel;
  recommendation: string;
  message: string;
}

export interface DehydrationForecast {
  type: "dehydration";
  riskLevel: RiskLevel;
  confidence: number;
  recommendation: string;
  weatherIndicators: {
    humidityPercent: number;
    tempF: number;
    windMph: number;
  };
}

export interface HardwarePredictionsBundle {
  breakout: BreakoutPrediction;
  sunDamage: SunDamageTrajectory;
  dehydration: DehydrationForecast;
}

// ==========================================
// 11. Resumable & Background Upload
// ==========================================

export interface UploadFileMeta {
  key: "rgb" | "depth" | "pointcloud" | "video" | "raw";
  uri: string;
  type: string;
  sizeBytes: number;
}

export interface BackgroundUploadJob {
  id: string;
  scanId: string;
  files: UploadFileMeta[];
  priority: "high" | "normal" | "low";
  wifiOnly: boolean;
  status: "queued" | "uploading" | "completed" | "failed";
  progress: number; // 0 - 100
  createdAt: string;
}
