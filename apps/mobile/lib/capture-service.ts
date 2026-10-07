import * as Speech from "expo-speech";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import type {
  CaptureMode,
  PoseTarget,
  HeadPose,
  FrameScore,
  CapturedFrame,
  ScoredFrame,
  CaptureConfig,
  AlignmentStatus,
  FaceBoundingMetrics,
  AlignmentEvaluation,
} from "@skinsense/types";

// ──────────────────────────────────────────────
// Voice & Haptic Guidance (Phase 3, Level 1)
// ──────────────────────────────────────────────

export async function speakGuidance(text: string) {
  try {
    const isSpeaking = await Speech.isSpeakingAsync();
    if (isSpeaking) {
      // Allow current phrase to finish completely — never cut off words mid-speech!
      return;
    }
    Speech.speak(text, {
      language: "en-US",
      pitch: 1.0,
      rate: 1.02,
    });
  } catch (err) {
    // Non-fatal if speech is not supported in current environment
    console.debug("[CaptureGuidance] Speech skipped:", err);
  }
}

export async function stopGuidance() {
  try {
    await Speech.stop();
  } catch {}
}

/**
 * Intelligent Debounced Voice Guidance Controller
 * Prevents overlapping utterances, self-interruptions, and rapid phrase spamming.
 */
class GuidanceVoiceManager {
  private lastSpokenText = "";
  private lastSpokenTime = 0;
  private minIntervalMs = 2800; // 2.8 seconds between duplicate corrections
  private isMuted = false;

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      stopGuidance();
    }
  }

  getMuted(): boolean {
    return this.isMuted;
  }

  async speak(text: string, force = false) {
    if (this.isMuted) return;

    const now = Date.now();
    const timeSinceLast = now - this.lastSpokenTime;

    if (!force) {
      // Don't interrupt if currently speaking
      try {
        const isSpeaking = await Speech.isSpeakingAsync();
        if (isSpeaking) return;
      } catch {}

      // Skip if same phrase was spoken very recently
      if (text === this.lastSpokenText && timeSinceLast < this.minIntervalMs) {
        return;
      }

      // Skip if another phrase was spoken within cooldown
      if (timeSinceLast < 2000) {
        return;
      }
    } else {
      // Forced transition (e.g. pose advance or capture completed)
      await stopGuidance();
    }

    this.lastSpokenText = text;
    this.lastSpokenTime = now;
    await speakGuidance(text);
  }

  reset() {
    this.lastSpokenText = "";
    this.lastSpokenTime = 0;
    stopGuidance();
  }
}

export const voiceManager = new GuidanceVoiceManager();

export async function triggerCaptureHaptic() {
  try {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch {}
}

export async function triggerPoseChangeHaptic() {
  try {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setTimeout(async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }, 150);
    }
  } catch {}
}

export async function triggerBlockedHaptic() {
  try {
    if (Platform.OS !== "web") {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  } catch {}
}

export async function triggerSuccessHaptic() {
  try {
    if (Platform.OS !== "web") {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  } catch {}
}

export async function triggerSelectionTick() {
  try {
    if (Platform.OS !== "web") {
      await Haptics.selectionAsync();
    }
  } catch {}
}

export async function triggerLockHaptic() {
  try {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  } catch {}
}

/**
 * Multi-Modal Sonar Feedback Manager (Phase 3, Level 1)
 * Provides real-time proximity feedback (tempo ramps up as alignment score approaches 100%).
 * Uses rhythmic tactile pulses so the user holding the back camera gets immediate
 * proximity feedback without seeing the screen.
 */
class SonarFeedbackManager {
  private activeInterval: any = null;
  private currentScore = 0;
  private isMuted = false;

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) this.stop();
  }

  updateProximity(score: number, isAligned: boolean) {
    this.currentScore = score;
    if (this.isMuted || score <= 20) {
      this.stop();
      return;
    }

    // Interval ramps from 650ms (score ~30%) down to 140ms (score >= 90%)
    const intervalMs = Math.max(140, Math.round(650 - (score / 100) * 500));

    if (this.activeInterval) {
      clearInterval(this.activeInterval);
    }

    this.activeInterval = setInterval(() => {
      if (isAligned) {
        triggerLockHaptic();
      } else {
        triggerSelectionTick();
      }
    }, intervalMs);
  }

  stop() {
    if (this.activeInterval) {
      clearInterval(this.activeInterval);
      this.activeInterval = null;
    }
  }
}

export const sonarManager = new SonarFeedbackManager();

// ──────────────────────────────────────────────
// Face Alignment Engine (Level 1 Guidance Math)
// ──────────────────────────────────────────────

export const TARGET_YAW_ANGLES: Record<PoseTarget, number> = {
  frontal: 0,
  left_45: -45,
  right_45: 45,
};

/**
 * Evaluates whether face is centered, at the right distance, and at target yaw.
 * Ideal target box:
 * - centerX: 0.50 (tolerance: ±0.12)
 * - centerY: 0.44 (tolerance: ±0.14)
 * - scale (boxHeight): 0.42 - 0.62 (ideal ~0.50)
 * - yaw: targetYaw ± 8°
 */
export function evaluateFaceAlignment(
  metrics: FaceBoundingMetrics,
  targetPose: PoseTarget = "frontal",
): AlignmentEvaluation {
  // If box size is 0 or uninitialized, no face is detected
  if (metrics.boxWidth <= 0.05 || metrics.boxHeight <= 0.05) {
    return {
      status: "NO_FACE",
      score: 0,
      instruction:
        targetPose === "left_45"
          ? "Turn head 45° to your left"
          : targetPose === "right_45"
          ? "Turn head 45° to your right"
          : "Hold phone facing your face at eye level",
      isAligned: false,
      dx: 0,
      dy: 0,
      scale: 0,
    };
  }

  const isProfile = targetPose === "left_45" || targetPose === "right_45";
  const idealCenterX = 0.5;
  const idealCenterY = 0.44;
  // Standard clinical framing scale thresholds across all 3 poses:
  const minScale = 0.34;
  const maxScale = 0.68;
  const targetYaw = TARGET_YAW_ANGLES[targetPose];

  const dx = metrics.centerX - idealCenterX;
  const dy = metrics.centerY - idealCenterY;
  const scale = metrics.boxHeight;
  const yawDiff = metrics.yaw - targetYaw;

  // Enforce strict centering within the oval guide for all poses
  const maxDx = 0.085;
  const maxDy = 0.10;

  // Face boundary edges (0.0 to 1.0)
  const boxLeft = metrics.centerX - metrics.boxWidth / 2;
  const boxRight = metrics.centerX + metrics.boxWidth / 2;
  const boxTop = metrics.centerY - metrics.boxHeight / 2;
  const boxBottom = metrics.centerY + metrics.boxHeight / 2;

  // Calculate component error penalties (0.0 = perfect, 1.0 = out of range)
  const xError = Math.min(1, Math.abs(dx) / (maxDx + 0.04));
  const yError = Math.min(1, Math.abs(dy) / (maxDy + 0.04));

  let scaleError = 0;
  if (scale < minScale) {
    scaleError = Math.min(1, (minScale - scale) / 0.18);
  } else if (scale > maxScale) {
    scaleError = Math.min(1, (scale - maxScale) / 0.18);
  }

  // Yaw tolerance: for 45° profile poses, allow ±18° window (27° to 63° is accepted)
  const maxYawTolerance = isProfile ? 18 : 12;
  const yawError = Math.min(1, Math.abs(yawDiff) / (maxYawTolerance + 6));

  // Composite alignment score (0 - 100)
  const compositeScore = Math.round(
    Math.max(
      0,
      100 -
        (xError * 30 +
          yError * 25 +
          scaleError * 25 +
          yawError * 20),
    ),
  );

  // Determine specific actionable guidance state:
  // 1. Distance checks
  if (scale < minScale) {
    return {
      status: "TOO_FAR",
      score: Math.min(85, compositeScore),
      instruction: "Move phone closer",
      isAligned: false,
      dx,
      dy,
      scale,
    };
  }

  if (scale > maxScale) {
    return {
      status: "TOO_CLOSE",
      score: Math.min(85, compositeScore),
      instruction: "Move phone back a bit",
      isAligned: false,
      dx,
      dy,
      scale,
    };
  }

  // 2. Strict centering checks (includes edge cut-off prevention)
  if (dx < -maxDx || boxLeft < 0.04) {
    return {
      status: "OFF_CENTER_LEFT",
      score: Math.min(85, compositeScore),
      instruction: "Move phone slightly left",
      isAligned: false,
      dx,
      dy,
      scale,
    };
  }

  if (dx > maxDx || boxRight > 0.96) {
    return {
      status: "OFF_CENTER_RIGHT",
      score: Math.min(85, compositeScore),
      instruction: "Move phone slightly right",
      isAligned: false,
      dx,
      dy,
      scale,
    };
  }

  if (dy < -maxDy || boxTop < 0.04) {
    return {
      status: "OFF_CENTER_UP",
      score: Math.min(85, compositeScore),
      instruction: "Move phone down slightly",
      isAligned: false,
      dx,
      dy,
      scale,
    };
  }

  if (dy > maxDy || boxBottom > 0.96) {
    return {
      status: "OFF_CENTER_DOWN",
      score: Math.min(85, compositeScore),
      instruction: "Move phone up slightly",
      isAligned: false,
      dx,
      dy,
      scale,
    };
  }

  // 3. Head yaw rotation checks
  if (Math.abs(yawDiff) > maxYawTolerance) {
    let yawInstruction = "Center your head";
    if (targetPose === "left_45") {
      yawInstruction = yawDiff > 0 ? "Turn head 45° to your left" : "Turn head slightly right";
    } else if (targetPose === "right_45") {
      yawInstruction = yawDiff < 0 ? "Turn head 45° to your right" : "Turn head slightly left";
    } else {
      yawInstruction = yawDiff > 0 ? "Turn slightly left" : "Turn slightly right";
    }

    return {
      status: "WRONG_YAW",
      score: Math.min(85, compositeScore),
      instruction: yawInstruction,
      isAligned: false,
      dx,
      dy,
      scale,
    };
  }

  // All criteria within acceptable clinical tolerance!
  return {
    status: "ALIGNED",
    score: Math.max(90, compositeScore),
    instruction: "Hold still... Perfect alignment",
    isAligned: true,
    dx,
    dy,
    scale,
  };
}

export function calculateHeadYaw(
  noseTipX: number,
  leftEarX: number,
  rightEarX: number,
): number {
  const midpointX = (leftEarX + rightEarX) / 2;
  const offset = noseTipX - midpointX;
  const earDistance = Math.abs(rightEarX - leftEarX);
  if (earDistance <= 0.001) return 0;
  return Math.round(Math.atan2(offset, earDistance) * (180 / Math.PI));
}

export function checkPoseAlignment(
  currentYaw: number,
  target: PoseTarget,
  tolerance = 8,
): { aligned: boolean; diff: number; instruction: string } {
  const targetYaw = TARGET_YAW_ANGLES[target];
  const diff = currentYaw - targetYaw;

  if (Math.abs(diff) <= tolerance) {
    return {
      aligned: true,
      diff,
      instruction: "Hold still... Perfect alignment",
    };
  }

  if (target === "frontal") {
    return {
      aligned: false,
      diff,
      instruction: diff > 0 ? "Turn slightly left towards center" : "Turn slightly right towards center",
    };
  }

  if (target === "left_45") {
    return {
      aligned: false,
      diff,
      instruction: currentYaw > targetYaw ? "Turn more to your left (45°)" : "Turn back slightly right",
    };
  }

  return {
    aligned: false,
    diff,
    instruction: currentYaw < targetYaw ? "Turn more to your right (45°)" : "Turn back slightly left",
  };
}


// ──────────────────────────────────────────────
// Frame Scoring (Phase 3, Section 3)
// ──────────────────────────────────────────────

export function scoreFrame(
  sharpness: number,
  stability: number,
  exposure: number,
  eyeOpen = true,
): FrameScore {
  return {
    sharpness: Math.max(0, Math.min(100, sharpness)),
    stability: Math.max(0, Math.min(1, stability)),
    exposure: Math.max(0, Math.min(1, exposure)),
    eyeOpen,
  };
}

export function compositeFrameScore(score: FrameScore): number {
  if (!score.eyeOpen) return 0;
  return score.sharpness * 0.45 + score.stability * 30 + score.exposure * 25;
}

export function selectBestFrame(scoredFrames: ScoredFrame[]): CapturedFrame {
  const eligible = scoredFrames.filter((s) => s.score.eyeOpen);
  const candidates = eligible.length > 0 ? eligible : scoredFrames;
  const sorted = [...candidates].sort(
    (a, b) => compositeFrameScore(b.score) - compositeFrameScore(a.score),
  );
  return sorted[0]!.frame;
}

// ──────────────────────────────────────────────
// Capture Service Orchestrator (Phase 3, Section 1.2)
// ──────────────────────────────────────────────

export class CaptureService {
  private mode: CaptureMode;
  private currentPoseIndex = 0;
  private poses: PoseTarget[] = ["frontal", "left_45", "right_45"];
  private capturedFrames: CapturedFrame[] = [];

  constructor(mode: CaptureMode = "audio_guided") {
    this.mode = mode;
  }

  setMode(mode: CaptureMode) {
    this.mode = mode;
  }

  getMode(): CaptureMode {
    return this.mode;
  }

  getCurrentPose(): PoseTarget {
    return this.poses[this.currentPoseIndex] || "frontal";
  }

  getPoseIndex(): number {
    return this.currentPoseIndex;
  }

  getTotalPoses(): number {
    return this.poses.length;
  }

  async startSequence() {
    this.currentPoseIndex = 0;
    this.capturedFrames = [];

    if (this.mode === "audio_guided") {
      await speakGuidance("Hold the phone at arm's length facing your face.");
    } else if (this.mode === "mirror") {
      await speakGuidance("Face your mirror and point the rear camera at your reflection.");
    } else if (this.mode === "assisted") {
      await speakGuidance("Photographer, please center the subject's face in the frame.");
    } else {
      await speakGuidance("Front camera selfie mode active. Center your face.");
    }
  }

  async advancePose(): Promise<{ done: boolean; nextPose?: PoseTarget }> {
    this.currentPoseIndex += 1;
    if (this.currentPoseIndex >= this.poses.length) {
      await triggerSuccessHaptic();
      await speakGuidance("All angles captured! Processing your photos.");
      return { done: true };
    }

    const next = this.poses[this.currentPoseIndex]!;
    await triggerPoseChangeHaptic();

    if (next === "left_45") {
      await speakGuidance("Photo taken! Now slowly turn your head to the left.");
    } else if (next === "right_45") {
      await speakGuidance("Great! Now slowly turn your head to the right.");
    }

    return { done: false, nextPose: next };
  }

  recordCapturedFrame(frame: CapturedFrame) {
    this.capturedFrames.push(frame);
  }

  getAllFrames(): CapturedFrame[] {
    return this.capturedFrames;
  }

  reset() {
    this.currentPoseIndex = 0;
    this.capturedFrames = [];
    stopGuidance();
  }
}
