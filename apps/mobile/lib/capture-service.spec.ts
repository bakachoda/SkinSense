jest.mock("react-native", () => ({
  Platform: { OS: "ios" },
}));

jest.mock("expo-speech", () => ({
  speak: jest.fn(),
  stop: jest.fn(),
  isSpeakingAsync: jest.fn().mockResolvedValue(false),
}));

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: "light", Medium: "medium", Heavy: "heavy" },
  NotificationFeedbackType: { Success: "success", Warning: "warning", Error: "error" },
}));

import {
  calculateHeadYaw,
  checkPoseAlignment,
  scoreFrame,
  compositeFrameScore,
  selectBestFrame,
} from "./capture-service";

describe("Phase 3 Mobile Capture Service", () => {
  describe("Head Yaw Geometry & Alignment", () => {
    it("computes 0° yaw when nose tip is exactly centered between ears", () => {
      const yaw = calculateHeadYaw(0.5, 0.2, 0.8);
      expect(yaw).toBe(0);
    });

    it("computes negative yaw when head turns left", () => {
      // Nose shifts left towards left ear
      const yaw = calculateHeadYaw(0.35, 0.2, 0.8);
      expect(yaw).toBeLessThan(0);
    });

    it("computes positive yaw when head turns right", () => {
      // Nose shifts right towards right ear
      const yaw = calculateHeadYaw(0.65, 0.2, 0.8);
      expect(yaw).toBeGreaterThan(0);
    });

    it("validates alignment within tolerance window", () => {
      const frontal = checkPoseAlignment(2, "frontal", 5);
      expect(frontal.aligned).toBe(true);

      const left45Aligned = checkPoseAlignment(-44, "left_45", 5);
      expect(left45Aligned.aligned).toBe(true);

      const left45Missed = checkPoseAlignment(-20, "left_45", 5);
      expect(left45Missed.aligned).toBe(false);
      expect(left45Missed.instruction).toContain("Turn more to your left");
    });
  });

  describe("Frame Scoring & Best Frame Selection", () => {
    it("penalizes frames where eyes are closed", () => {
      const openScore = scoreFrame(80, 0.9, 0.85, true);
      const closedScore = scoreFrame(95, 0.95, 0.9, false);

      expect(compositeFrameScore(openScore)).toBeGreaterThan(0);
      expect(compositeFrameScore(closedScore)).toBe(0);
    });

    it("selects sharper and more stable frame from recorded video burst", () => {
      const frameA = {
        frame: {
          uri: "frame_a.jpg",
          pose: "frontal" as const,
          exposureEv: 0,
          flash: false,
          timestamp: 1000,
        },
        score: scoreFrame(40, 0.5, 0.6, true),
      };

      const frameB = {
        frame: {
          uri: "frame_b.jpg",
          pose: "frontal" as const,
          exposureEv: 0,
          flash: false,
          timestamp: 1033,
        },
        score: scoreFrame(88, 0.95, 0.85, true),
      };

      const selected = selectBestFrame([frameA, frameB]);
      expect(selected.uri).toBe("frame_b.jpg");
    });
  });
});
