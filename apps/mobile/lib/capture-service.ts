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
} from "@skinsense/types";

// ──────────────────────────────────────────────
// Voice & Haptic Guidance (Phase 3, Section 1.3)
// ──────────────────────────────────────────────

export async function speakGuidance(text: string) {
  try {
    const isSpeaking = await Speech.isSpeakingAsync();
    if (isSpeaking) {
      await Speech.stop();
    }
    Speech.speak(text, {
      language: "en-US",
      pitch: 1.0,
      rate: 0.95,
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

// ──────────────────────────────────────────────
// Pose Alignment & Geometry (Phase 3, Section 2)
// ──────────────────────────────────────────────

export const TARGET_YAW_ANGLES: Record<PoseTarget, number> = {
  frontal: 0,
  left_45: -45,
  right_45: 45,
};

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
