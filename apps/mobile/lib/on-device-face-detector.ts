import Constants from "expo-constants";
import type { FaceBoundingMetrics } from "@skinsense/types";

let FaceDetection: any = null;

try {
  FaceDetection = require("@react-native-ml-kit/face-detection").default;
} catch {
  // ML Kit not available — will fall back to vision bridge
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

// ── ML Kit path (dev build — on-device, ~20ms) ──

async function detectWithMLKit(
  imageUri: string,
  imageWidth: number,
  imageHeight: number,
): Promise<FaceDetectionResult> {
  const faces = await FaceDetection.detect(imageUri, DETECT_OPTIONS);
  if (!faces || faces.length === 0) {
    return { faceDetected: false, metrics: EMPTY_METRICS };
  }

  let largest = faces[0];
  let largestArea = 0;
  for (const face of faces) {
    const area = face.bounds.width * face.bounds.height;
    if (area > largestArea) {
      largestArea = area;
      largest = face;
    }
  }

  const b = largest.bounds;
  return {
    faceDetected: true,
    metrics: {
      centerX: Math.max(0, Math.min(1, (b.x + b.width / 2) / imageWidth)),
      centerY: Math.max(0, Math.min(1, (b.y + b.height / 2) / imageHeight)),
      boxWidth: Math.max(0, Math.min(1, b.width / imageWidth)),
      boxHeight: Math.max(0, Math.min(1, b.height / imageHeight)),
      yaw: largest.headEulerAngleY ?? 0,
    },
  };
}

// ── Vision bridge path (Expo Go — HTTP to Python on port 5005, ~200ms) ──

let cachedBridgeUrl: string | null = null;

function getBridgeCandidates(): string[] {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;
  const hostIp = hostUri ? hostUri.split(":")[0] : "10.37.58.16";
  return [
    `http://${hostIp}:5005/detect-face`,
    `http://10.37.58.16:5005/detect-face`,
    `http://127.0.0.1:5005/detect-face`,
  ];
}

async function detectWithBridge(
  base64Image: string,
  targetPose: string,
): Promise<FaceDetectionResult> {
  const payload = JSON.stringify({ image: base64Image, targetPose });
  const tryUrl = async (url: string) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
    });
    if (!res.ok) throw new Error("not ok");
    return res.json();
  };

  let data: any = null;

  if (cachedBridgeUrl) {
    try {
      data = await tryUrl(cachedBridgeUrl);
    } catch {
      cachedBridgeUrl = null;
    }
  }

  if (!data) {
    for (const url of getBridgeCandidates()) {
      try {
        data = await tryUrl(url);
        cachedBridgeUrl = url;
        break;
      } catch {
        // try next
      }
    }
  }

  if (!data || typeof data.faceDetected !== "boolean") {
    return { faceDetected: false, metrics: EMPTY_METRICS };
  }

  if (!data.faceDetected) {
    return { faceDetected: false, metrics: EMPTY_METRICS };
  }

  return {
    faceDetected: true,
    metrics: {
      centerX: data.centerX ?? 0,
      centerY: data.centerY ?? 0,
      boxWidth: data.boxWidth ?? 0,
      boxHeight: data.boxHeight ?? 0,
      yaw: data.yaw ?? 0,
    },
  };
}

// ── Public API ──

export const useMLKit = FaceDetection !== null;

export async function detectFaceLocal(
  imageUri: string,
  imageWidth: number,
  imageHeight: number,
): Promise<FaceDetectionResult> {
  if (!FaceDetection) {
    return { faceDetected: false, metrics: EMPTY_METRICS };
  }
  try {
    return await detectWithMLKit(imageUri, imageWidth, imageHeight);
  } catch (err) {
    console.warn("[FaceDetector] ML Kit failed:", err);
    return { faceDetected: false, metrics: EMPTY_METRICS };
  }
}

export async function detectFaceViaBridge(
  base64Image: string,
  targetPose: string = "frontal",
): Promise<FaceDetectionResult> {
  try {
    return await detectWithBridge(base64Image, targetPose);
  } catch {
    return { faceDetected: false, metrics: EMPTY_METRICS };
  }
}

export function isFaceDetectionAvailable(): boolean {
  return FaceDetection !== null;
}
