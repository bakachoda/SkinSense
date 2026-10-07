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
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: "light", Medium: "medium", Heavy: "heavy" },
  NotificationFeedbackType: { Success: "success", Warning: "warning", Error: "error" },
}));

import {
  calculateHeadYaw,
  checkPoseAlignment,
  scoreFrame,
  compositeFrameScore,
  selectBestFrame,
  evaluateFaceAlignment,
  voiceManager,
  sonarManager,
} from "./capture-service";
import * as Speech from "expo-speech";

describe("Phase 3 Mobile Capture Service", () => {
  describe("Level 1 FaceAlignmentEngine", () => {
    it("returns NO_FACE and score 0 when face bounding box is uninitialized", () => {
      const result = evaluateFaceAlignment({
        centerX: 0,
        centerY: 0,
        boxWidth: 0,
        boxHeight: 0,
        yaw: 0,
      });

      expect(result.status).toBe("NO_FACE");
      expect(result.score).toBe(0);
      expect(result.isAligned).toBe(false);
      expect(result.instruction).toContain("Hold phone facing your face");
    });

    it("returns TOO_FAR when face box scale is below threshold", () => {
      const result = evaluateFaceAlignment({
        centerX: 0.5,
        centerY: 0.44,
        boxWidth: 0.28,
        boxHeight: 0.28,
        yaw: 0,
      });

      expect(result.status).toBe("TOO_FAR");
      expect(result.isAligned).toBe(false);
      expect(result.instruction).toBe("Move phone closer");
    });

    it("returns TOO_CLOSE when face box scale is above threshold", () => {
      const result = evaluateFaceAlignment({
        centerX: 0.5,
        centerY: 0.44,
        boxWidth: 0.75,
        boxHeight: 0.75,
        yaw: 0,
      });

      expect(result.status).toBe("TOO_CLOSE");
      expect(result.isAligned).toBe(false);
      expect(result.instruction).toBe("Move phone back a bit");
    });

    it("returns OFF_CENTER_LEFT when face is to the left", () => {
      const result = evaluateFaceAlignment({
        centerX: 0.32,
        centerY: 0.44,
        boxWidth: 0.5,
        boxHeight: 0.5,
        yaw: 0,
      });

      expect(result.status).toBe("OFF_CENTER_LEFT");
      expect(result.isAligned).toBe(false);
      expect(result.instruction).toBe("Move phone slightly left");
    });

    it("returns OFF_CENTER_RIGHT when face is to the right", () => {
      const result = evaluateFaceAlignment({
        centerX: 0.68,
        centerY: 0.44,
        boxWidth: 0.5,
        boxHeight: 0.5,
        yaw: 0,
      });

      expect(result.status).toBe("OFF_CENTER_RIGHT");
      expect(result.isAligned).toBe(false);
      expect(result.instruction).toBe("Move phone slightly right");
    });

    it("returns WRONG_YAW when head rotation exceeds target yaw tolerance", () => {
      const result = evaluateFaceAlignment({
        centerX: 0.5,
        centerY: 0.44,
        boxWidth: 0.5,
        boxHeight: 0.5,
        yaw: 20, // 20° vs target 0°
      });

      expect(result.status).toBe("WRONG_YAW");
      expect(result.isAligned).toBe(false);
    });

    it("returns ALIGNED with score >= 90 when within optimal box bounds", () => {
      const result = evaluateFaceAlignment({
        centerX: 0.5,
        centerY: 0.44,
        boxWidth: 0.5,
        boxHeight: 0.5,
        yaw: 0,
      });

      expect(result.status).toBe("ALIGNED");
      expect(result.isAligned).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(90);
      expect(result.instruction).toBe("Hold still... Perfect alignment");
    });
  });

  describe("Level 1 Multi-Modal Feedback (Voice & Sonar)", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      voiceManager.reset();
      voiceManager.setMuted(false);
      sonarManager.stop();
      sonarManager.setMuted(false);
    });

    it("mutes and silences voice guidance when muted", async () => {
      voiceManager.setMuted(true);
      await voiceManager.speak("Move phone closer");
      expect(Speech.speak).not.toHaveBeenCalled();
    });

    it("sonar stops when muted or score is low", () => {
      sonarManager.updateProximity(15, false);
      expect((sonarManager as any).activeInterval).toBeNull();

      sonarManager.setMuted(true);
      sonarManager.updateProximity(80, false);
      expect((sonarManager as any).activeInterval).toBeNull();
    });

    it("sonar ramps interval faster as score increases", () => {
      sonarManager.updateProximity(50, false);
      expect((sonarManager as any).activeInterval).not.toBeNull();
      sonarManager.stop();
      expect((sonarManager as any).activeInterval).toBeNull();
    });
  });

  describe("Head Yaw Geometry & Alignment", () => {
    it("computes 0° yaw when nose tip is exactly centered between ears", () => {
      const yaw = calculateHeadYaw(0.5, 0.2, 0.8);
      expect(yaw).toBe(0);
    });

    it("computes negative yaw when head turns left", () => {
      const yaw = calculateHeadYaw(0.35, 0.2, 0.8);
      expect(yaw).toBeLessThan(0);
    });

    it("computes positive yaw when head turns right", () => {
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
