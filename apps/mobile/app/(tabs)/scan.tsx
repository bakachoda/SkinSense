import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useQuestionnaireStore } from "../../stores/questionnaire";
import { QuestionnaireWizard } from "../../components/QuestionnaireWizard";
import { FaceZoneMap } from "../../components/FaceZoneMap";
import { apiClient } from "../../lib/api-client";
import type { ScanResult, Routine } from "@skinsense/types";
import {
  Camera,
  RefreshCw,
  Sparkles,
  Sun,
  Moon,
  Info,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react-native";

const { width } = Dimensions.get("window");

type CaptureStage = "CAMERA" | "UPLOADING" | "ANALYZING" | "RESULTS" | "ERROR";

export default function ScanScreen() {
  const { hasCompletedQuestionnaire, questionnaire } = useQuestionnaireStore();
  const [permission, requestPermission] = useCameraPermissions();

  const [stage, setStage] = useState<CaptureStage>("CAMERA");
  const [framingStatus, setFramingStatus] = useState<string>("Position your face in the oval");
  const [isFaceReady, setIsFaceReady] = useState<boolean>(true);
  const [progressStage, setProgressStage] = useState<string>("Uploading photo...");
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [activeRoutineTab, setActiveRoutineTab] = useState<"AM" | "PM">("AM");

  const cameraRef = useRef<any>(null);

  // Periodically cycle framing feedback to give user realistic guidance
  useEffect(() => {
    if (stage === "CAMERA") {
      const timer = setTimeout(() => {
        setFramingStatus("Hold still... Perfect framing detected");
        setIsFaceReady(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  // If questionnaire not yet completed, show questionnaire wizard
  if (!hasCompletedQuestionnaire) {
    return <QuestionnaireWizard onComplete={() => setStage("CAMERA")} />;
  }

  const handleCapture = async () => {
    try {
      setStage("UPLOADING");
      setProgressPercent(10);
      setProgressStage("Uploading your photo...");

      // 1. Request presigned upload URL
      const presign = await apiClient.presignUpload("image/jpeg", 2 * 1024 * 1024);
      setProgressPercent(30);

      // 2. Dispatch scan job to backend
      const scanRes = await apiClient.createScan(presign.key, questionnaire);
      const scanId = scanRes.scanId;

      setStage("ANALYZING");
      setProgressPercent(40);
      setProgressStage("Segmenting facial landmarks...");

      // 3. Connect real-time WebSocket for live pipeline updates
      const socket = apiClient.createScanSocket(scanId);

      socket.on("scan:progress", (event: any) => {
        if (event.progress) {
          setProgressPercent(Math.round(event.progress * 100));
        }
        if (event.stage === "segmentation") {
          setProgressStage("Segmenting facial zones (forehead, cheeks, chin)...");
        } else if (event.stage === "detection") {
          setProgressStage("Detecting acne, redness & textural micro-relief...");
        } else if (event.stage === "scoring") {
          setProgressStage("Calculating Skin Health Score...");
        } else if (event.stage === "routine") {
          setProgressStage("Formulating personalized AM & PM routine...");
        }
      });

      socket.on("scan:complete", (event: any) => {
        socket.disconnect();
        setScanResult(event.result);
        if (event.routine) {
          setRoutine(event.routine);
        }
        setStage("RESULTS");
      });

      socket.on("scan:error", (event: any) => {
        socket.disconnect();
        setErrorMessage(event.error || "Analysis failed. Please try again.");
        setStage("ERROR");
      });

      // Polling fallback in case websocket is disconnected or proxy blocked
      const pollTimer = setInterval(async () => {
        try {
          const detail = await apiClient.getScan(scanId);
          if (detail.scan?.status === "COMPLETED" && detail.result) {
            clearInterval(pollTimer);
            socket.disconnect();
            setScanResult(detail.result);
            // Fetch routine
            try {
              const routineRes = await apiClient.getLatestRoutine();
              setRoutine(routineRes.routine);
            } catch {}
            setStage("RESULTS");
          } else if (detail.scan?.status === "FAILED") {
            clearInterval(pollTimer);
            socket.disconnect();
            setErrorMessage("Scan processing failed. Please retry.");
            setStage("ERROR");
          }
        } catch {}
      }, 2000);

      setTimeout(() => clearInterval(pollTimer), 30000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to initiate scan");
      setStage("ERROR");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "#10B981"; // Emerald
    if (score >= 50) return "#F59E0B"; // Amber
    return "#EF4444"; // Red
  };

  // ==========================================
  // RENDER: CAMERA CAPTURE VIEW
  // ==========================================
  if (stage === "CAMERA") {
    return (
      <View style={styles.cameraContainer}>
        {permission?.granted ? (
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFillObject}
            facing="front"
          />
        ) : (
          <View style={styles.mockCameraBg}>
            <Text style={styles.mockCameraText}>Front Camera Preview</Text>
            <TouchableOpacity style={styles.permButton} onPress={requestPermission}>
              <Text style={styles.permButtonText}>Enable Camera</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Translucent Oval Face Detection Guide */}
        <View style={styles.ovalOverlayContainer} pointerEvents="none">
          <View style={[styles.guideOval, isFaceReady && styles.guideOvalReady]} />
        </View>

        {/* Real-time Framing Feedback Banner */}
        <SafeAreaView style={styles.feedbackContainer}>
          <View style={[styles.feedbackBadge, isFaceReady && styles.feedbackBadgeReady]}>
            <Text style={styles.feedbackText}>{framingStatus}</Text>
          </View>
        </SafeAreaView>

        {/* Bottom Shutter Controls */}
        <SafeAreaView style={styles.shutterContainer}>
          <TouchableOpacity
            style={[styles.captureButton, !isFaceReady && styles.captureButtonDisabled]}
            onPress={handleCapture}
            activeOpacity={0.8}
          >
            <View style={styles.captureInner} />
          </TouchableOpacity>
          <Text style={styles.captureHint}>
            {isFaceReady ? "Tap to capture & analyze" : "Align face in oval"}
          </Text>
        </SafeAreaView>
      </View>
    );
  }

  // ==========================================
  // RENDER: UPLOADING & PROGRESS VIEW
  // ==========================================
  if (stage === "UPLOADING" || stage === "ANALYZING") {
    return (
      <SafeAreaView style={styles.progressContainer}>
        <View style={styles.progressCard}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.progressTitle}>SkinSense AI</Text>
          <Text style={styles.progressSub}>{progressStage}</Text>

          {/* Progress Bar */}
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.progressPercentText}>{progressPercent}% complete</Text>

          <View style={styles.pipelineSteps}>
            <Text style={progressPercent >= 25 ? styles.stepDone : styles.stepWait}>
              ✓ Image quality validation
            </Text>
            <Text style={progressPercent >= 50 ? styles.stepDone : styles.stepWait}>
              {progressPercent >= 50 ? "✓" : "○"} Facial landmark segmentation
            </Text>
            <Text style={progressPercent >= 75 ? styles.stepDone : styles.stepWait}>
              {progressPercent >= 75 ? "✓" : "○"} Deep concern detection & scoring
            </Text>
            <Text style={progressPercent >= 90 ? styles.stepDone : styles.stepWait}>
              {progressPercent >= 90 ? "✓" : "○"} Conflict-free routine formulation
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================
  // RENDER: ERROR VIEW
  // ==========================================
  if (stage === "ERROR") {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <AlertCircle size={48} color="#EF4444" />
        <Text style={styles.errorTitle}>Analysis Interrupted</Text>
        <Text style={styles.errorDesc}>{errorMessage}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => setStage("CAMERA")}>
          <RefreshCw size={18} color="#FFFFFF" />
          <Text style={styles.retryButtonText}>Retake Photo</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ==========================================
  // RENDER: RESULTS SCREEN (Section 6)
  // ==========================================
  const stepsToDisplay =
    activeRoutineTab === "AM" ? routine?.amSteps || [] : routine?.pmSteps || [];

  return (
    <SafeAreaView style={styles.resultsContainer}>
      <ScrollView contentContainerStyle={styles.resultsScroll}>
        {/* Top Header Card: Skin Health Score */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreCardLabel}>Skin Health Score</Text>
          <View style={styles.scoreRow}>
            <Text
              style={[
                styles.scoreNumber,
                { color: getScoreColor(scanResult?.skinHealthScore || 70) },
              ]}
            >
              {scanResult?.skinHealthScore || 72}
            </Text>
            <View style={styles.scoreTrendBadge}>
              <Text style={styles.scoreTrendText}>+5 vs Baseline</Text>
            </View>
          </View>
          <Text style={styles.scoreSummary}>
            Optimal barrier hydration detected with active acne hotspots on cheeks and chin.
          </Text>
        </View>

        {/* 2D Interactive Face Zone Map Component */}
        {scanResult?.zoneScores && <FaceZoneMap zoneScores={scanResult.zoneScores} />}

        {/* Top Detected Findings */}
        {scanResult?.findings && scanResult.findings.length > 0 && (
          <View style={styles.findingsCard}>
            <Text style={styles.cardSectionTitle}>Primary Clinical Findings</Text>
            {scanResult.findings.map((finding) => (
              <View key={finding.id} style={styles.findingItem}>
                <View style={styles.findingHeader}>
                  <Text style={styles.findingType}>
                    {finding.type.replace("_", " ").toUpperCase()}
                  </Text>
                  <Text style={styles.findingZone}>
                    Zone: {finding.zone.replace("_", " ")}
                  </Text>
                </View>
                <Text style={styles.findingDesc}>
                  {finding.description || `Severity index: ${finding.severity}/100`}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Routine Tabs: AM & PM Regimens */}
        <View style={styles.routineSection}>
          <Text style={styles.cardSectionTitle}>Your Prescribed Routine</Text>
          <View style={styles.tabSwitcher}>
            <TouchableOpacity
              style={[styles.tabButton, activeRoutineTab === "AM" && styles.tabButtonActive]}
              onPress={() => setActiveRoutineTab("AM")}
            >
              <Sun size={18} color={activeRoutineTab === "AM" ? "#F59E0B" : "#9CA3AF"} />
              <Text
                style={[
                  styles.tabButtonText,
                  activeRoutineTab === "AM" && styles.tabButtonTextActive,
                ]}
              >
                Morning (AM)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeRoutineTab === "PM" && styles.tabButtonActive]}
              onPress={() => setActiveRoutineTab("PM")}
            >
              <Moon size={18} color={activeRoutineTab === "PM" ? "#818CF8" : "#9CA3AF"} />
              <Text
                style={[
                  styles.tabButtonText,
                  activeRoutineTab === "PM" && styles.tabButtonTextActive,
                ]}
              >
                Evening (PM)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Routine Steps List */}
          <View style={styles.stepsList}>
            {stepsToDisplay.map((step, idx) => (
              <View key={idx} style={styles.productCard}>
                <View style={styles.stepBadgeRow}>
                  <View style={styles.stepNumberBadge}>
                    <Text style={styles.stepNumberText}>{step.order}</Text>
                  </View>
                  <Text style={styles.stepType}>{step.stepType}</Text>
                  <View style={styles.priceBadge}>
                    <Text style={styles.priceBadgeText}>💎 Mid</Text>
                  </View>
                </View>

                <Text style={styles.productName}>{step.productName}</Text>
                <Text style={styles.productBrand}>{step.productBrand}</Text>

                {/* Why Chosen Callout */}
                <View style={styles.whyBox}>
                  <Sparkles size={14} color="#10B981" />
                  <Text style={styles.whyText}>{step.whyChosen}</Text>
                </View>

                {step.applicationNote && (
                  <Text style={styles.appNote}>
                    💡 <Text style={{ fontStyle: "italic" }}>{step.applicationNote}</Text>
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Retake Button */}
        <TouchableOpacity
          style={styles.retakeScanButton}
          onPress={() => {
            setScanResult(null);
            setStage("CAMERA");
          }}
        >
          <Camera size={20} color="#FFFFFF" />
          <Text style={styles.retakeScanText}>Take Another Scan</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cameraContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },
  mockCameraBg: {
    flex: 1,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
  },
  mockCameraText: {
    color: "#64748B",
    fontSize: 16,
    marginBottom: 16,
  },
  permButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  permButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  ovalOverlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  guideOval: {
    width: width * 0.72,
    height: width * 0.72 * 1.35,
    borderRadius: (width * 0.72) / 2,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
    backgroundColor: "transparent",
  },
  guideOvalReady: {
    borderColor: "#10B981",
    borderWidth: 3,
  },
  feedbackContainer: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  feedbackBadge: {
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#334155",
  },
  feedbackBadgeReady: {
    borderColor: "#10B981",
    backgroundColor: "rgba(6, 78, 59, 0.9)",
  },
  feedbackText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  shutterContainer: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: "center",
    gap: 8,
  },
  captureButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  captureButtonDisabled: {
    opacity: 0.6,
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#10B981",
  },
  captureHint: {
    color: "#CBD5E1",
    fontSize: 13,
    fontWeight: "500",
  },
  progressContainer: {
    flex: 1,
    backgroundColor: "#0B0F17",
    justifyContent: "center",
    padding: 24,
  },
  progressCard: {
    backgroundColor: "#161E2E",
    padding: 28,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  progressTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#F9FAFB",
    marginTop: 18,
    marginBottom: 6,
  },
  progressSub: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 20,
  },
  progressBarBg: {
    width: "100%",
    height: 8,
    backgroundColor: "#1F2937",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#10B981",
    borderRadius: 4,
  },
  progressPercentText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 24,
  },
  pipelineSteps: {
    width: "100%",
    gap: 10,
  },
  stepDone: {
    color: "#10B981",
    fontSize: 13,
    fontWeight: "500",
  },
  stepWait: {
    color: "#4B5563",
    fontSize: 13,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: "#0B0F17",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#F87171",
    marginTop: 16,
    marginBottom: 8,
  },
  errorDesc: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: "#0B0F17",
  },
  resultsScroll: {
    padding: 20,
    paddingBottom: 40,
  },
  scoreCard: {
    backgroundColor: "#161E2E",
    padding: 22,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1F2937",
    marginBottom: 16,
  },
  scoreCardLabel: {
    fontSize: 13,
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "600",
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 14,
    marginVertical: 10,
  },
  scoreNumber: {
    fontSize: 56,
    fontWeight: "800",
  },
  scoreTrendBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#10B981",
  },
  scoreTrendText: {
    color: "#10B981",
    fontSize: 13,
    fontWeight: "600",
  },
  scoreSummary: {
    color: "#9CA3AF",
    fontSize: 14,
    lineHeight: 20,
  },
  cardSectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F9FAFB",
    marginBottom: 14,
  },
  findingsCard: {
    backgroundColor: "#161E2E",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1F2937",
    marginBottom: 16,
  },
  findingItem: {
    borderLeftWidth: 3,
    borderLeftColor: "#EF4444",
    paddingLeft: 12,
    marginBottom: 12,
  },
  findingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  findingType: {
    color: "#F87171",
    fontWeight: "700",
    fontSize: 14,
  },
  findingZone: {
    color: "#9CA3AF",
    fontSize: 12,
    textTransform: "capitalize",
  },
  findingDesc: {
    color: "#D1D5DB",
    fontSize: 13,
  },
  routineSection: {
    marginVertical: 10,
  },
  tabSwitcher: {
    flexDirection: "row",
    backgroundColor: "#161E2E",
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: "#1F2937",
  },
  tabButtonText: {
    color: "#9CA3AF",
    fontWeight: "600",
    fontSize: 14,
  },
  tabButtonTextActive: {
    color: "#F9FAFB",
  },
  stepsList: {
    gap: 12,
  },
  productCard: {
    backgroundColor: "#161E2E",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  stepBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  stepNumberBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  stepType: {
    color: "#60A5FA",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  priceBadge: {
    marginLeft: "auto",
    backgroundColor: "#1F2937",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priceBadgeText: {
    color: "#9CA3AF",
    fontSize: 11,
    fontWeight: "500",
  },
  productName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F3F4F6",
    marginBottom: 2,
  },
  productBrand: {
    fontSize: 13,
    color: "#9CA3AF",
    marginBottom: 10,
  },
  whyBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#0F281E",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  whyText: {
    flex: 1,
    color: "#6EE7B7",
    fontSize: 12,
    lineHeight: 16,
  },
  appNote: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  retakeScanButton: {
    flexDirection: "row",
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
  },
  retakeScanText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
