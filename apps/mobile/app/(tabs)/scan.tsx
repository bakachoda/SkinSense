import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  useWindowDimensions,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useQuestionnaireStore } from "../../stores/questionnaire";
import { QuestionnaireWizard } from "../../components/QuestionnaireWizard";
import { FaceZoneMap } from "../../components/FaceZoneMap";
import { apiClient } from "../../lib/api-client";
import type {
  ScanResult,
  Routine,
  PoseTarget,
  PhysiologicalState,
  EnvironmentQualityScore,
  CreateSelfAssessment,
  CalibratedFinding,
  AlignmentStatus,
  FaceBoundingMetrics,
  AlignmentEvaluation,
} from "@skinsense/types";
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
  Lightbulb,
  HelpCircle,
  Volume2,
  VolumeX,
  Droplets,
  Ruler,
  Play,
  Check,
} from "lucide-react-native";
import { CircularProgressRing, AnalysisProgress } from "../../components/LoadingStates";
import { SelfAssessmentView } from "../../components/SelfAssessmentView";
import { BarrierHealthCard } from "../../components/BarrierHealthCard";
import { SkinAgeCard } from "../../components/SkinAgeCard";
import { DifferentialDiagnosisView } from "../../components/DifferentialDiagnosisView";
import { ClinicalGradingCard } from "../../components/ClinicalGradingCard";
import { SafetyScreeningCard } from "../../components/SafetyScreeningCard";
import { DeviceHardwareBadge } from "../../components/DeviceHardwareBadge";
import { Topology3DViewer } from "../../components/Topology3DViewer";
import { PredictiveInsightsCard } from "../../components/PredictiveInsightsCard";
import {
  speakGuidance,
  stopGuidance,
  triggerCaptureHaptic,
  triggerPoseChangeHaptic,
  triggerSuccessHaptic,
  triggerSelectionTick,
  triggerLockHaptic,
  triggerBlockedHaptic,
  checkPoseAlignment,
  evaluateFaceAlignment,
  voiceManager,
  sonarManager,
  scoreFrame,
} from "../../lib/capture-service";

const { width } = Dimensions.get("window");

type CaptureStage =
  | "INSTRUCTIONS"
  | "CAMERA"
  | "UPLOADING"
  | "SELF_ASSESSMENT"
  | "ANALYZING"
  | "RESULTS"
  | "ERROR";

const POSES: { id: PoseTarget; label: string; targetYaw: number }[] = [
  { id: "frontal", label: "Frontal (0°)", targetYaw: 0 },
  { id: "left_45", label: "Left 45°", targetYaw: -45 },
  { id: "right_45", label: "Right 45°", targetYaw: 45 },
];

import { detectFace } from "../../lib/on-device-face-detector";

export default function ScanScreen() {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const ovalWidth = Math.min(224, Math.round(windowWidth * 0.58));
  const ovalHeight = Math.min(315, Math.round(windowHeight * 0.38));
  const insets = useSafeAreaInsets();

  const { hasCompletedQuestionnaire, questionnaire } = useQuestionnaireStore();
  const [permission, requestPermission] = useCameraPermissions();

  // Navigation & Stages
  const [stage, setStage] = useState<CaptureStage>("INSTRUCTIONS");
  const [currentPoseIndex, setCurrentPoseIndex] = useState<number>(0);
  const [capturedAngleFrames, setCapturedAngleFrames] = useState<string[]>([]);
  const [flashActive, setFlashActive] = useState<boolean>(false);
  const [voiceMuted, setVoiceMuted] = useState<boolean>(false);

  // Level 1 Face Metrics & Alignment
  const [faceMetrics, setFaceMetrics] = useState<FaceBoundingMetrics>({
    centerX: 0,
    centerY: 0,
    boxWidth: 0,
    boxHeight: 0,
    yaw: 0,
  });
  const [alignmentEval, setAlignmentEval] = useState<AlignmentEvaluation>({
    status: "NO_FACE",
    score: 0,
    instruction: "Hold phone facing your face at eye level",
    isAligned: false,
    dx: 0,
    dy: 0,
    scale: 0,
  });
  const [holdProgressMs, setHoldProgressMs] = useState<number>(0);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const isSamplingRef = useRef<boolean>(false);

  const [checklistCompleted, setChecklistCompleted] = useState<boolean>(false);
  const [physiologicalState, setPhysiologicalState] = useState<PhysiologicalState>({
    exercised: false,
    hotShower: false,
  });
  const [environmentScore, setEnvironmentScore] = useState<EnvironmentQualityScore>("green");
  const [isWhiteCalibrated, setIsWhiteCalibrated] = useState<boolean>(true);
  const [calibrationKey, setCalibrationKey] = useState<string>("calibrations/white-ref-d65.jpg");

  // Real-time Guidance Feedback
  const [framingStatus, setFramingStatus] = useState<string>("Hold phone facing your face at eye level");
  const [isPoseAligned, setIsPoseAligned] = useState<boolean>(false);
  const [activeScanId, setActiveScanId] = useState<string>("");

  // Progress Tracking & Pipeline States
  const [progressStage, setProgressStage] = useState<string>("Uploading photo...");
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [serverStage, setServerStage] = useState<string>("segmentation");

  // Output Results & Regimen
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [activeRoutineTab, setActiveRoutineTab] = useState<"AM" | "PM">("AM");
  const [showGhostOverlay, setShowGhostOverlay] = useState<boolean>(false);

  const cameraRef = useRef<any>(null);
  const activePose = POSES[currentPoseIndex] || POSES[0]!;


  // Sync voiceManager and sonarManager mute state
  useEffect(() => {
    voiceManager.setMuted(voiceMuted);
    sonarManager.setMuted(voiceMuted);
    if (voiceMuted) {
      sonarManager.stop();
    }
  }, [voiceMuted]);

  // Speak initial guidance when camera stage opens
  useEffect(() => {
    if (stage === "CAMERA" && !voiceMuted) {
      const timer = setTimeout(() => {
        voiceManager.speak("Hold phone at eye level. Center your face in the oval guide.", true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  // Level 1: Face alignment evaluation engine & Sonar Audio Feedback Loop
  useEffect(() => {
    if (stage === "CAMERA") {
      const evaluation = evaluateFaceAlignment(faceMetrics, activePose.id);
      setAlignmentEval(evaluation);
      setIsPoseAligned(evaluation.isAligned);
      setFramingStatus(evaluation.instruction);

      // Trigger debounced voice guidance
      if (!voiceMuted) {
        voiceManager.speak(evaluation.instruction);
      }

      // Trigger proximity sonar feedback loop
      if (!voiceMuted && checklistCompleted) {
        sonarManager.updateProximity(evaluation.score, evaluation.isAligned);
      } else {
        sonarManager.stop();
      }
    } else {
      sonarManager.stop();
    }

    return () => {
      sonarManager.stop();
    };
  }, [faceMetrics, currentPoseIndex, stage, voiceMuted, checklistCompleted]);

  // Level 1: Auto-capture countdown loop (800ms stability gate)
  useEffect(() => {
    let timer: any = null;

    if (
      stage === "CAMERA" &&
      checklistCompleted &&
      alignmentEval.isAligned &&
      !isCapturing
    ) {
      timer = setInterval(() => {
        setHoldProgressMs((prev) => {
          const next = prev + 100;
          if (next === 100) {
            triggerSelectionTick();
          }
          if (next >= 800) {
            clearInterval(timer);
            // 800ms hold complete -> trigger auto-capture!
            captureCurrentAngle();
            return 0;
          }
          return next;
        });
      }, 100);
    } else {
      if (holdProgressMs > 0 && !alignmentEval.isAligned) {
        triggerBlockedHaptic();
      }
      setHoldProgressMs(0);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [stage, checklistCompleted, alignmentEval.isAligned, isCapturing, currentPoseIndex]);

  // Face detection sampling loop — ML Kit on-device only
  useEffect(() => {
    let timeoutId: any = null;
    let isDisposed = false;

    console.log("[Scan] sampling effect:", { stage, granted: permission?.granted, isCapturing });

    async function sampleFrame() {
      if (isDisposed || stage !== "CAMERA" || !permission?.granted) return;

      if (!isCapturing && cameraRef.current && !isSamplingRef.current) {
        isSamplingRef.current = true;
        try {
          const snapshot = await cameraRef.current.takePictureAsync({
            quality: 0.4,
            base64: false,
            shutterSound: false,
          });

          if (isDisposed) { isSamplingRef.current = false; return; }

          if (snapshot?.uri) {
            const result = await detectFace(snapshot.uri, snapshot.width, snapshot.height);

            if (!isDisposed) {
              if (result.faceDetected) {
                setFaceMetrics(result.metrics);
              } else {
                setFaceMetrics({
                  centerX: 0,
                  centerY: 0,
                  boxWidth: 0,
                  boxHeight: 0,
                  yaw: 0,
                });
              }
            }
          }
        } catch (e) {
          console.warn("[Scan] sampling error:", e);
        } finally {
          isSamplingRef.current = false;
        }
      }

      if (!isDisposed) {
        timeoutId = setTimeout(sampleFrame, 250);
      }
    }

    if (stage === "CAMERA" && permission?.granted) {
      timeoutId = setTimeout(sampleFrame, 500);
    }

    return () => {
      isDisposed = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [stage, permission?.granted, isCapturing, currentPoseIndex]);

  // If questionnaire not yet completed, show questionnaire wizard
  if (!hasCompletedQuestionnaire) {
    return <QuestionnaireWizard onComplete={() => setStage("INSTRUCTIONS")} />;
  }



  const captureCurrentAngle = async () => {
    if (isCapturing) return;
    setIsCapturing(true);
    setHoldProgressMs(0);
    console.log("=== CAPTURE TRIGGERED! currentPoseIndex:", currentPoseIndex);

    try {
      await triggerLockHaptic();

      // Rear torch pulse (illuminates face + tactile visual shutter cue)
      setFlashActive(true);
      await new Promise((resolve) => setTimeout(() => resolve(true), 140));

      let frameUri = `scans/pose_${activePose.id}_${Date.now()}.jpg`;

      if (cameraRef.current?.takePictureAsync) {
        try {
          const photo = await cameraRef.current.takePictureAsync({
            quality: 0.92,
            base64: true,
            skipProcessing: false,
          });
          if (photo?.uri) {
            frameUri = photo.uri;
          }
          if (photo?.base64) {
            (globalThis as any).__lastCapturedBase64 = photo.base64;
          }
        } catch (camErr) {
          console.warn("[CameraView] takePictureAsync error:", camErr);
        }
      }

      setFlashActive(false);

      const nextFrames = [...capturedAngleFrames, frameUri];
      setCapturedAngleFrames(nextFrames);

      // Check if more angles need capturing
      if (currentPoseIndex < POSES.length - 1) {
        const nextIndex = currentPoseIndex + 1;
        const nextPose = POSES[nextIndex]!;
        setCurrentPoseIndex(nextIndex);
        setFaceMetrics({
          centerX: 0,
          centerY: 0,
          boxWidth: 0,
          boxHeight: 0,
          yaw: 0,
        });
        await triggerPoseChangeHaptic();

        if (!voiceMuted) {
          if (nextPose.id === "left_45") {
            voiceManager.speak("Photo taken! Now slowly turn your head to the left.", true);
          } else if (nextPose.id === "right_45") {
            voiceManager.speak("Great! Now slowly turn your head to the right.", true);
          }
        }
      } else {
        // All 3 angles completed!
        await triggerSuccessHaptic();
        if (!voiceMuted) {
          voiceManager.speak("All angles captured! Uploading multi-angle dataset.", true);
        }
        await submitMultiAngleDataset(nextFrames);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Capture error");
      setStage("ERROR");
    } finally {
      setIsCapturing(false);
    }
  };

  const submitMultiAngleDataset = async (frames: string[]) => {
    setStage("UPLOADING");
    setProgressPercent(15);
    setProgressStage("Uploading photo for analysis...");

    try {
      setProgressPercent(35);

      const imageBase64 = (globalThis as any).__lastCapturedBase64 as string | undefined;
      if (!imageBase64) {
        throw new Error("No photo data captured. Please retake the scan.");
      }

      const scanRes = await apiClient.createScan({
        imageKeys: frames,
        imageBase64,
        calibrationKey: isWhiteCalibrated ? calibrationKey : undefined,
        captureMode: "audio_guided",
        frameCount: frames.length,
        environmentScore,
        physiologicalState,
        questionnaire,
      });

      const scanId = scanRes.scanId;
      setActiveScanId(scanId);

      // 3. Seamlessly transition to Dual Validation Self-Assessment
      setStage("SELF_ASSESSMENT");

      // 4. Connect real-time WebSocket for live pipeline updates
      const socket = apiClient.createScanSocket(scanId);

      socket.on("scan:progress", (event: any) => {
        if (event.progress) {
          setProgressPercent(Math.round(event.progress * 100));
        }
        if (event.stage) {
          setServerStage(event.stage);
        }
        if (event.stage === "preprocessing") {
          setProgressStage("Normalizing white balance to D65 & merging HDR brackets...");
        } else if (event.stage === "segmentation") {
          setProgressStage("Segmenting facial zones and computing 3D head pose...");
        } else if (event.stage === "detection") {
          setProgressStage("Detecting acne, erythema & specular oiliness...");
        } else if (event.stage === "scoring") {
          setProgressStage("Calculating Skin Health Score & scale normalization...");
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

      // Polling fallback: the BullMQ job may finish before the WebSocket joins the room
      let pollStopped = false;
      const stopPolling = () => { pollStopped = true; };
      socket.on("scan:complete", stopPolling);
      socket.on("scan:error", stopPolling);

      const pollForResult = async () => {
        const delays = [3000, 4000, 5000, 6000, 8000, 10000];
        for (const delay of delays) {
          if (pollStopped) return;
          await new Promise((r) => setTimeout(r, delay));
          if (pollStopped) return;
          try {
            const res = await apiClient.getScanResult(scanId);
            if (res?.result && !pollStopped) {
              pollStopped = true;
              socket.disconnect();
              setScanResult(res.result);
              setStage("RESULTS");
              return;
            }
          } catch {
            // scan still processing — continue polling
          }
        }
      };
      pollForResult();
    } catch (err: any) {
      console.warn("[Capture] Upload failed:", err);
      setErrorMessage(err.message || "Could not reach the analysis server. Check your connection and try again.");
      setStage("ERROR");
    }
  };

  const handleSelfAssessmentComplete = async (data: CreateSelfAssessment) => {
    try {
      if (activeScanId) {
        const res = await apiClient.submitSelfAssessment(activeScanId, data);
        if (res.findings && scanResult) {
          setScanResult({
            ...scanResult,
            findings: res.findings,
          });
        }
      }
      setStage("ANALYZING");
    } catch {
      setStage("ANALYZING");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "#10B981"; // Emerald
    if (score >= 50) return "#F59E0B"; // Amber
    return "#EF4444"; // Red
  };

  // ==========================================
  // RENDER: INSTRUCTIONS SCREEN
  // ==========================================
  if (stage === "INSTRUCTIONS") {
    return (
      <SafeAreaView style={styles.instructionsContainer}>
        <View style={styles.instructionsContent}>
          <View style={styles.instructionsIconCircle}>
            <Camera size={40} color="#10B981" />
          </View>
          <Text style={styles.instructionsTitle}>Skin Scan</Text>
          <Text style={styles.instructionsSubtitle}>
            We'll capture 3 angles of your face for a complete analysis.
          </Text>

          <View style={styles.instructionsList}>
            <View style={styles.instructionItem}>
              <View style={styles.instructionBullet}>
                <Sun size={16} color="#F59E0B" />
              </View>
              <Text style={styles.instructionText}>
                Find good, even lighting — natural daylight works best
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.instructionBullet}>
                <Camera size={16} color="#06B6D4" />
              </View>
              <Text style={styles.instructionText}>
                Hold the phone at arm's length, rear camera facing you
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.instructionBullet}>
                <Volume2 size={16} color="#8B5CF6" />
              </View>
              <Text style={styles.instructionText}>
                Voice guidance will walk you through each pose — just listen and follow
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.instructionBullet}>
                <Check size={16} color="#10B981" />
              </View>
              <Text style={styles.instructionText}>
                Stay still when aligned — photos are captured automatically
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.instructionsBottom}>
          <TouchableOpacity
            style={styles.startScanButton}
            onPress={async () => {
              if (!permission?.granted) {
                const result = await requestPermission();
                if (!result.granted) return;
              }
              setChecklistCompleted(true);
              setCurrentPoseIndex(0);
              setCapturedAngleFrames([]);
              setHoldProgressMs(0);
              setStage("CAMERA");
            }}
            activeOpacity={0.8}
          >
            <Play size={20} color="#FFFFFF" />
            <Text style={styles.startScanText}>Start Scan</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================
  // RENDER: CAMERA CAPTURE VIEW
  // ==========================================
  if (stage === "CAMERA") {
    return (
      <View style={styles.cameraContainer}>
        {flashActive && <View style={styles.flashOverlay} pointerEvents="none" />}

        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={flashActive}
        />

        {/* Minimal top bar: pose progress + voice mute */}
        <View style={[styles.topSection, { paddingTop: Math.max(insets.top, Platform.OS === "android" ? 38 : 20) }]}>
          <View style={styles.topHudBar}>
            {/* Pose progress dots (non-interactive) */}
            <View style={styles.poseDotsRow}>
              {POSES.map((pose, idx) => (
                <View
                  key={pose.id}
                  style={[
                    styles.poseDot,
                    idx < currentPoseIndex && styles.poseDotDone,
                    idx === currentPoseIndex && styles.poseDotCurrent,
                  ]}
                />
              ))}
            </View>

            {/* Voice mute toggle */}
            <TouchableOpacity
              style={styles.topIconBtn}
              onPress={() => setVoiceMuted(!voiceMuted)}
              activeOpacity={0.8}
            >
              {voiceMuted ? (
                <VolumeX size={15} color="#EF4444" />
              ) : (
                <Volume2 size={15} color="#10B981" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Guide oval */}
        <View style={styles.ovalOverlayContainer} pointerEvents="none">
          <View
            style={[
              styles.guideOval,
              { width: ovalWidth, height: ovalHeight, borderRadius: ovalWidth / 2 },
              alignmentEval.status === "ALIGNED"
                ? styles.guideOvalReady
                : alignmentEval.status === "NO_FACE"
                  ? styles.guideOvalNoFace
                  : styles.guideOvalAdjusting,
              activePose.id === "left_45" && styles.guideOvalLeft,
              activePose.id === "right_45" && styles.guideOvalRight,
            ]}
          >
            <View style={styles.crosshairH} />
            <View style={styles.crosshairV} />

            {holdProgressMs > 0 && (
              <View style={styles.holdCountdownBox}>
                <Text style={styles.holdCountdownText}>
                  {((800 - holdProgressMs) / 1000).toFixed(1)}s
                </Text>
                <View style={styles.holdProgressBar}>
                  <View
                    style={[
                      styles.holdProgressFill,
                      { width: `${(holdProgressMs / 800) * 100}%` },
                    ]}
                  />
                </View>
              </View>
            )}
          </View>
        </View>

      </View>
    );
  }

  // ==========================================
  // RENDER: UPLOADING VIEW (Circular Ring)
  // ==========================================
  if (stage === "UPLOADING") {
    return (
      <SafeAreaView style={styles.progressContainer}>
        <View style={styles.progressCard}>
          <CircularProgressRing progress={progressPercent} label={progressStage} />
          <Text style={styles.progressSub}>Analyzing your skin...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================
  // RENDER: SELF-ASSESSMENT DUAL VALIDATION
  // ==========================================
  if (stage === "SELF_ASSESSMENT") {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#0B0F19" }}>
        <SelfAssessmentView
          onComplete={handleSelfAssessmentComplete}
          isSubmitting={serverStage === "scoring"}
        />
      </SafeAreaView>
    );
  }

  // ==========================================
  // RENDER: ANALYZING VIEW (3-Stage Animation)
  // ==========================================
  if (stage === "ANALYZING") {
    return (
      <SafeAreaView style={styles.progressContainer}>
        <View style={styles.progressCard}>
          <AnalysisProgress
            serverStage={serverStage}
            onTimeoutWait={() => {}}
            onTimeoutHome={() => setStage("INSTRUCTIONS")}
          />
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
        <TouchableOpacity style={styles.retryButton} onPress={() => setStage("INSTRUCTIONS")}>
          <RefreshCw size={18} color="#FFFFFF" />
          <Text style={styles.retryButtonText}>Retake Photo</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ==========================================
  // RENDER: RESULTS SCREEN (Phase 3 Calibrated)
  // ==========================================
  const stepsToDisplay =
    activeRoutineTab === "AM" ? routine?.amSteps || [] : routine?.pmSteps || [];

  return (
    <SafeAreaView style={styles.resultsContainer}>
      <ScrollView contentContainerStyle={styles.resultsScroll} showsVerticalScrollIndicator={false}>
        {/* Top Header Card: Skin Health Score */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreTopRow}>
            <Text style={styles.scoreCardLabel}>Diagnostic Skin Health Score</Text>
            <View style={styles.phaseBadge}>
              <Sparkles size={12} color="#10B981" />
              <Text style={styles.phaseBadgeText}>Phase 3 High-Res</Text>
            </View>
          </View>

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
            Multi-angle fusion verified {scanResult?.findings?.length || 3} localized concerns across
            6 facial zones.
          </Text>

          {/* Scale Normalization Callout */}
          <View style={styles.scaleCallout}>
            <Ruler size={13} color="#94A3B8" />
            <Text style={styles.scaleText}>
              Scale: {scanResult?.scaleFactorMm || 10.2} px/mm (Standard 62mm IPD Normalization)
            </Text>
          </View>
        </View>

        {/* 2D Interactive Face Zone Map Component */}
        {scanResult?.zoneScores && <FaceZoneMap zoneScores={scanResult.zoneScores} />}

        {/* Phase 3 Specular Oiliness Breakdown */}
        {scanResult?.oilinessMap && (
          <View style={styles.oilinessCard}>
            <View style={styles.oilinessHeader}>
              <Droplets size={16} color="#3B82F6" />
              <Text style={styles.cardSectionTitle}>Specular Oiliness Analysis (Glare-Isolated)</Text>
            </View>
            <View style={styles.oilinessGrid}>
              {Object.entries(scanResult.oilinessMap).map(([zone, val]) => (
                <View key={zone} style={styles.oilinessItem}>
                  <Text style={styles.oilinessZone}>{zone.replace("_", " ").toUpperCase()}</Text>
                  <Text style={styles.oilinessValue}>{val}%</Text>
                  <View style={styles.oilinessBarBg}>
                    <View
                      style={[
                        styles.oilinessBarFill,
                        {
                          width: `${val}%`,
                          backgroundColor: val > 60 ? "#F59E0B" : "#3B82F6",
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Calibrated Clinical Findings (Phase 3 Dual Validation) */}
        {scanResult?.findings && scanResult.findings.length > 0 && (
          <View style={styles.findingsCard}>
            <Text style={styles.cardSectionTitle}>Calibrated Clinical Findings</Text>
            {scanResult.findings.map((finding: any) => {
              const isHigh = finding.calibratedConfidence === "HIGH";
              const isUserOnly = finding.source === "user_only";

              return (
                <View key={finding.id} style={styles.findingItem}>
                  <View style={styles.findingHeader}>
                    <Text style={styles.findingType}>
                      {finding.type.replace("_", " ").toUpperCase()}
                    </Text>

                    {/* Calibration Confidence Badge */}
                    <View
                      style={[
                        styles.calibratedBadge,
                        isHigh && styles.badgeHigh,
                        isUserOnly && styles.badgeUser,
                      ]}
                    >
                      <Text
                        style={[
                          styles.calibratedBadgeText,
                          isHigh && styles.textHigh,
                          isUserOnly && styles.textUser,
                        ]}
                      >
                        {isHigh
                          ? "✓ Verified by You & AI"
                          : isUserOnly
                            ? "📍 User Marked Area"
                            : "AI Detection"}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.findingZone}>
                    Zone: {finding.zone.replace("_", " ")}
                  </Text>
                  <Text style={styles.findingDesc}>
                    {finding.description || `Severity index: ${finding.severity}/100`}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Phase 4: Barrier Health Composite & Lockout Gatekeeping */}
        <BarrierHealthCard
          barrierResult={(scanResult as any)?.barrierHealth}
          barrierScore={(scanResult as any)?.barrierScore}
        />

        {/* Phase 4: Biological Skin Age Model */}
        <SkinAgeCard
          skinAgeResult={(scanResult as any)?.skinAge}
          fallbackChronological={26}
        />

        {/* Phase 4: Spatial Differential Diagnosis */}
        {(scanResult as any)?.differential && (
          <DifferentialDiagnosisView
            differentialResult={(scanResult as any).differential}
          />
        )}

        {/* Phase 4: Clinical Dermatological Grading (GAGS & IGA) */}
        {(scanResult as any)?.clinicalGrading && (
          <ClinicalGradingCard
            clinicalGrading={(scanResult as any).clinicalGrading}
          />
        )}

        {/* Phase 4: ABCDE Lesion Safety & Melanated Skin Safeguards */}
        <SafetyScreeningCard
          safetyResults={(scanResult as any)?.safetyFlags}
          fitzpatrickTone={(scanResult as any)?.fitzpatrick || 3}
        />

        {/* Phase 5: 3D Topology, rPPG Blood Flow, and 240fps Viscoelasticity */}
        <Topology3DViewer
          topology={(scanResult as any)?.metadata?.topology || {
            classification: (scanResult as any)?.topologyClassification || "raised",
            lesionHeightMm: (scanResult as any)?.lesionHeightMm || 1.6,
            poreAnalysis: {
              averageDepthMm: (scanResult as any)?.poreDepthMm || 0.35,
              maxDepthMm: 0.72,
              congestionScore: 6.8,
              poreCount: 142,
            },
          }}
          elasticity={(scanResult as any)?.metadata?.elasticity || {
            overallGrade: (scanResult as any)?.elasticityScore || "good",
            recoveryTimeMs: (scanResult as any)?.elasticityRecoveryTimeMs || 259,
            firmnessScore: 8.7,
          }}
          rppg={(scanResult as any)?.metadata?.rppg || {
            perfusionScore: (scanResult as any)?.perfusionScore || 8.5,
            peakBpm: 72,
            inflammationStatus: (scanResult as any)?.inflammationStatus || "active",
            capillaryDilationIndex: 7.7,
            isVascularRosaceaPattern: (scanResult as any)?.differential?.primary?.patternType === "rosacea",
            subclinicalInflammationDetected: true,
          }}
        />

        {/* Phase 5: Predictive Analytics (Breakout 48h, Sun Damage Trajectory, Dehydration) */}
        <PredictiveInsightsCard
          predictions={(scanResult as any)?.metadata?.predictions}
        />

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
            setCapturedAngleFrames([]);
            setCurrentPoseIndex(0);
            setChecklistCompleted(false);
            setStage("INSTRUCTIONS");
          }}
        >
          <Camera size={20} color="#FFFFFF" />
          <Text style={styles.retakeScanText}>Take Another Scan</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const OVAL_WIDTH = Math.min(250, Math.round(SCREEN_WIDTH * 0.64));
const OVAL_HEIGHT = Math.min(330, Math.round(SCREEN_HEIGHT * 0.40));

const styles = StyleSheet.create({
  cameraContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },
  flashOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#FFFFFF",
    zIndex: 999,
  },
  instructionsContainer: {
    flex: 1,
    backgroundColor: "#0B0F19",
    justifyContent: "space-between",
  },
  instructionsContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  instructionsIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#F1F5F9",
    marginBottom: 8,
  },
  instructionsSubtitle: {
    fontSize: 15,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  instructionsList: {
    width: "100%",
    gap: 18,
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  instructionBullet: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: "#CBD5E1",
    lineHeight: 20,
    paddingTop: 8,
  },
  instructionsBottom: {
    alignItems: "center",
    paddingBottom: 36,
    paddingHorizontal: 28,
  },
  mockCameraBg: {
    flex: 1,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  mockCameraText: {
    color: "#94A3B8",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  permButton: {
    backgroundColor: "#10B981",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  permButtonText: {
    color: "#0B0F19",
    fontWeight: "700",
    fontSize: 13,
  },
  topSection: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
  },
  topHudBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  poseDotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  poseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  poseDotCurrent: {
    backgroundColor: "#F59E0B",
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  poseDotDone: {
    backgroundColor: "#10B981",
  },
  topIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(15, 23, 42, 0.82)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  ovalOverlayContainer: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
  guideOval: {
    width: OVAL_WIDTH,
    height: OVAL_HEIGHT,
    borderRadius: OVAL_WIDTH / 2,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  guideOvalReady: {
    borderColor: "#10B981",
    borderStyle: "solid",
    backgroundColor: "transparent",
    shadowColor: "#10B981",
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 6,
  },
  guideOvalAdjusting: {
    borderColor: "#F59E0B",
    borderStyle: "solid",
    backgroundColor: "rgba(245, 158, 11, 0.05)",
  },
  guideOvalNoFace: {
    borderColor: "rgba(239, 68, 68, 0.4)",
    borderStyle: "dashed",
    backgroundColor: "transparent",
  },
  guideOvalLeft: {
    transform: [{ rotate: "-8deg" }],
  },
  guideOvalRight: {
    transform: [{ rotate: "8deg" }],
  },
  crosshairH: {
    position: "absolute",
    width: 40,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  crosshairV: {
    position: "absolute",
    width: 1,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  holdCountdownBox: {
    position: "absolute",
    bottom: 24,
    backgroundColor: "rgba(11, 15, 25, 0.9)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#10B981",
    gap: 4,
  },
  holdCountdownText: {
    color: "#10B981",
    fontSize: 12,
    fontWeight: "700",
  },
  holdProgressBar: {
    width: 90,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
    overflow: "hidden",
  },
  holdProgressFill: {
    height: "100%",
    backgroundColor: "#10B981",
    borderRadius: 2,
  },
  shutterContainer: {
    position: "absolute",
    bottom: Platform.OS === "android" ? 20 : 16,
    width: "100%",
    alignItems: "center",
    zIndex: 30,
  },
  startScanButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#10B981",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 28,
  },
  startScanText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  progressContainer: {
    flex: 1,
    backgroundColor: "#0B0F19",
    alignItems: "center",
    justifyContent: "center",
  },
  progressCard: {
    width: "88%",
    alignItems: "center",
  },
  progressSub: {
    color: "#64748B",
    fontSize: 11,
    marginTop: 16,
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    backgroundColor: "#0B0F19",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#F1F5F9",
    marginTop: 16,
  },
  errorDesc: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 18,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EF4444",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: "#0B0F19",
  },
  resultsScroll: {
    padding: 16,
    paddingBottom: 40,
  },
  scoreCard: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  scoreTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  scoreCardLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.5,
  },
  phaseBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  phaseBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#10B981",
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 12,
    marginVertical: 4,
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: "800",
  },
  scoreTrendBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  scoreTrendText: {
    fontSize: 11,
    color: "#10B981",
    fontWeight: "700",
  },
  scoreSummary: {
    fontSize: 12,
    color: "#CBD5E1",
    lineHeight: 18,
    marginTop: 4,
  },
  scaleCallout: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
  },
  scaleText: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
  },
  oilinessCard: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  oilinessHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  cardSectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#F1F5F9",
    letterSpacing: 0.5,
  },
  oilinessGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  oilinessItem: {
    width: (width - 64) / 2,
    backgroundColor: "#1E293B",
    padding: 10,
    borderRadius: 10,
  },
  oilinessZone: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94A3B8",
  },
  oilinessValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#E2E8F0",
    marginVertical: 2,
  },
  oilinessBarBg: {
    height: 4,
    backgroundColor: "#334155",
    borderRadius: 2,
    overflow: "hidden",
  },
  oilinessBarFill: {
    height: "100%",
  },
  findingsCard: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  findingItem: {
    backgroundColor: "#1E293B",
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
  },
  findingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  findingType: {
    fontSize: 13,
    fontWeight: "700",
    color: "#F8FAFC",
  },
  calibratedBadge: {
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeHigh: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
  },
  badgeUser: {
    backgroundColor: "rgba(245, 158, 11, 0.2)",
  },
  calibratedBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#60A5FA",
  },
  textHigh: {
    color: "#10B981",
  },
  textUser: {
    color: "#F59E0B",
  },
  findingZone: {
    fontSize: 11,
    color: "#94A3B8",
    marginBottom: 4,
  },
  findingDesc: {
    fontSize: 12,
    color: "#CBD5E1",
    lineHeight: 16,
  },
  routineSection: {
    marginBottom: 20,
  },
  tabSwitcher: {
    flexDirection: "row",
    backgroundColor: "#111827",
    borderRadius: 12,
    padding: 4,
    marginVertical: 10,
    gap: 6,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  tabButtonActive: {
    backgroundColor: "#1E293B",
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  tabButtonTextActive: {
    color: "#F1F5F9",
  },
  stepsList: {
    gap: 10,
  },
  productCard: {
    backgroundColor: "#111827",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  stepBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  stepNumberBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#0B0F19",
  },
  stepType: {
    fontSize: 12,
    fontWeight: "700",
    color: "#E2E8F0",
  },
  priceBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: "auto",
  },
  priceBadgeText: {
    fontSize: 10,
    color: "#94A3B8",
  },
  productName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F8FAFC",
  },
  productBrand: {
    fontSize: 12,
    color: "#94A3B8",
    marginBottom: 8,
  },
  whyBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    padding: 8,
    borderRadius: 8,
    gap: 6,
    marginBottom: 6,
  },
  whyText: {
    fontSize: 11,
    color: "#6EE7B7",
    flex: 1,
    lineHeight: 15,
  },
  appNote: {
    fontSize: 11,
    color: "#94A3B8",
  },
  retakeScanButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginTop: 8,
  },
  retakeScanText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0B0F19",
  },

  // Permission Gate styles
  permissionGate: {
    flex: 1,
    backgroundColor: "#0B0F19",
    justifyContent: "center",
    alignItems: "center",
  },
  permissionContent: {
    alignItems: "center",
    paddingHorizontal: 36,
  },
  permissionIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.25)",
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#F8FAFC",
    textAlign: "center",
    marginBottom: 12,
  },
  permissionDesc: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 28,
  },
  permissionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#06B6D4",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    gap: 10,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0B0F19",
  },
  permissionHint: {
    fontSize: 12,
    color: "#EF4444",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 18,
  },
});
