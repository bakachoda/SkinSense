// ──────────────────────────────────────────────
// Phase 6: Longitudinal Intelligence Types
// ──────────────────────────────────────────────

// ── Lifestyle Check-In ──

export interface LifestyleCheckIn {
  sleepHours: number;       // 0-14
  waterGlasses: number;     // 0-20
  stressLevel: number;      // 1-5 (1 = very relaxed, 5 = very stressed)
  exerciseMinutes: number;  // 0-180
  sunExposureMinutes: number; // 0-480
  dietTags: DietTag[];
  notes?: string;
}

export type DietTag =
  | "dairy"
  | "sugar"
  | "alcohol"
  | "caffeine"
  | "processed"
  | "gluten"
  | "spicy"
  | "fruits_veggies"
  | "supplements"
  | "water_rich";

export interface CreateLifestyleLog {
  date: string; // ISO date string (YYYY-MM-DD)
  checkIn: LifestyleCheckIn;
}

// ── Temporal Analytics ──

export type TrendDirection = "improving" | "stable" | "declining" | "volatile";
export type TrendWindow = "7d" | "30d" | "90d" | "all";

export interface TrendDataPoint {
  date: string;
  value: number;
  scanId?: string;
}

export interface ConcernTrend {
  concern: string;
  zone: string;
  direction: TrendDirection;
  slope: number;          // per-day change rate
  dataPoints: TrendDataPoint[];
  currentValue: number;
  previousValue: number;
  delta: number;
  confidence: number;     // 0-1
}

export interface Breakpoint {
  date: string;
  concern: string;
  zone: string;
  type: "peak" | "valley" | "inflection";
  valueBefore: number;
  valueAfter: number;
  possibleCause?: string; // "Routine changed", "Started retinol", etc.
}

export interface SeasonalPattern {
  concern: string;
  peakMonth: number;    // 1-12
  troughMonth: number;  // 1-12
  amplitude: number;    // severity swing magnitude
  description: string;  // "Acne tends to peak in August and improve in January"
}

export interface SkinTimeline {
  overallScoreHistory: TrendDataPoint[];
  concernTrends: ConcernTrend[];
  breakpoints: Breakpoint[];
  seasonalPatterns: SeasonalPattern[];
  totalScans: number;
  firstScanDate: string;
  latestScanDate: string;
}

// ── Skin Twin ──

export interface CohortProfile {
  fitzpatrick: number;
  ageRange: string;
  concerns: string[];
  climateZone?: string;
  cohortSize: number;
}

export interface PercentileRanking {
  metric: string;           // "skinHealthScore", "barrierScore", etc.
  userValue: number;
  percentile: number;       // 0-100
  cohortMedian: number;
  cohortP25: number;
  cohortP75: number;
}

export interface WhatWorked {
  productName: string;
  productCategory: string;
  successRate: number;      // 0-1
  usersWhoImproved: number;
  avgImprovement: number;   // score delta
  topConcern: string;
}

export interface SkinTwinResult {
  cohort: CohortProfile;
  rankings: PercentileRanking[];
  whatWorked: WhatWorked[];
  matchConfidence: number;  // 0-1
}

// ── Lifestyle Correlations ──

export interface LifestyleCorrelation {
  factor: string;           // "sleepHours", "waterGlasses", etc.
  threshold: string;        // "≥ 7 hours", "≥ 8 glasses", etc.
  skinMetric: string;       // "redness", "acne", "barrierScore"
  correlationStrength: number; // -1 to 1 (Pearson r)
  direction: "positive" | "negative"; // positive = factor increase → metric increase
  impact: string;           // "When you sleep 7+ hours, redness drops 18%"
  confidence: "high" | "medium" | "low";
  dataPointCount: number;
}

export interface HabitScore {
  category: string;         // "hydration", "sleep", "exercise", "diet", "sun_protection"
  score: number;            // 0-100
  streak: number;           // consecutive days meeting threshold
  bestStreak: number;       // all-time best streak
  trend: TrendDirection;
}

export interface LifestyleInsights {
  correlations: LifestyleCorrelation[];
  habitScores: HabitScore[];
  overallLifestyleScore: number; // 0-100
  totalCheckIns: number;
  currentStreak: number;
  bestStreak: number;
}

// ── Achievements ──

export type AchievementCategory =
  | "scanning"
  | "routine"
  | "lifestyle"
  | "improvement"
  | "social"
  | "milestones";

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;           // lucide icon name
  category: AchievementCategory;
  requirement: string;    // human-readable requirement
  threshold: number;      // numeric threshold to unlock
  xpReward: number;
}

export interface UserAchievement {
  achievementId: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  unlockedAt: string;     // ISO date
  progress: number;       // 0-1, 1 = unlocked
  isNew: boolean;         // true if unlocked since last viewed
}

export interface AchievementProgress {
  totalXp: number;
  level: number;          // 1-50
  xpToNextLevel: number;
  unlockedCount: number;
  totalCount: number;
  achievements: UserAchievement[];
  recentUnlocks: UserAchievement[];
}

// ── API Response Types ──

export interface TimelineResponse {
  timeline: SkinTimeline;
  window: TrendWindow;
}

export interface SkinTwinResponse {
  skinTwin: SkinTwinResult;
}

export interface LifestyleInsightsResponse {
  insights: LifestyleInsights;
}

export interface AchievementsResponse {
  progress: AchievementProgress;
}
