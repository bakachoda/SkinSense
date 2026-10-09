import type { FaceBoundingMetrics } from "@skinsense/types";

let FaceDetection: any = null;

try {
  const mod = require("@react-native-ml-kit/face-detection");
  FaceDetection = mod.default ?? mod;
  console.log("[FaceDetector] ML Kit loaded:", typeof FaceDetection?.detect);
} catch (e) {
  console.error("[FaceDetector] ML Kit FAILED to load — native module not linked:", e);
}

export interface FaceDetectionResult {
  faceDetected: boolean;
  metrics: FaceBoundingMetrics;
}

const EMPTY_METRICS: FaceBoundingMetrics = {
  centerX: 0,
  centerY: 0,
  boxWidth: 0,
  boxHeight: 0,
  yaw: 0,
};

const DETECT_OPTIONS = {
  performanceMode: "fast",
  landmarkMode: "none",
  classificationMode: "none",
  contourMode: "none",
  minFaceSize: 0.15,
};

let _logCount = 0;

export async function detectFace(
  imageUri: string,
  imageWidth: number,
  imageHeight: number,
): Promise<FaceDetectionResult> {
  if (!FaceDetection) {
    if (_logCount++ < 3) console.error("[FaceDetector] ML Kit is null — cannot detect");
    return { faceDetected: false, metrics: EMPTY_METRICS };
  }

  try {
    const uri = imageUri.startsWith("file://") ? imageUri : `file://${imageUri}`;
    const faces = await FaceDetection.detect(uri, DETECT_OPTIONS);

    if (!faces || faces.length === 0) {
      if (_logCount++ < 10) console.log("[FaceDetector] no face in frame");
      return { faceDetected: false, metrics: EMPTY_METRICS };
    }

    let largest = faces[0];
    let largestArea = 0;
    for (const face of faces) {
      const f = face.frame;
      const area = f.width * f.height;
      if (area > largestArea) {
        largestArea = area;
        largest = face;
      }
    }

    const f = largest.frame;
    if (_logCount++ < 10) {
      console.log("[FaceDetector] FACE FOUND", f.width + "x" + f.height, "yaw:", largest.rotationY);
    }

    return {
      faceDetected: true,
      metrics: {
        centerX: Math.max(0, Math.min(1, (f.left + f.width / 2) / imageWidth)),
        centerY: Math.max(0, Math.min(1, (f.top + f.height / 2) / imageHeight)),
        boxWidth: Math.max(0, Math.min(1, f.width / imageWidth)),
        boxHeight: Math.max(0, Math.min(1, f.height / imageHeight)),
        yaw: largest.rotationY ?? 0,
      },
    };
  } catch (err) {
    console.warn("[FaceDetector] detect() threw:", err);
    return { faceDetected: false, metrics: EMPTY_METRICS };
  }
}

export function isFaceDetectionAvailable(): boolean {
  return FaceDetection !== null;
}
