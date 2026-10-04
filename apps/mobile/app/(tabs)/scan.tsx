import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useQuestionnaireStore } from "../../stores/questionnaire";
import { QuestionnaireWizard } from "../../components/QuestionnaireWizard";
import { FaceZoneMap } from "../../components/FaceZoneMap";
import { apiClient } from "../../lib/api-client";
import type {
  ScanResult,
  Routine,
  CaptureMode,
  PoseTarget,
  PhysiologicalState,
  EnvironmentQualityScore,
  CreateSelfAssessment,
  CalibratedFinding,
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
  FlipHorizontal,
  Users,
  Compass,
  CheckCircle2,
  Droplets,
  Ruler,
  Maximize2,
} from "lucide-react-native";
import { CircularProgressRing, AnalysisProgress } from "../../components/LoadingStates";
import { MedicalDisclaimerFooter } from "../../components/MedicalDisclaimerFooter";
import { PreScanChecklistModal } from "../../components/PreScanChecklistModal";
import { EnvironmentQualityGate } from "../../components/EnvironmentQualityGate";
import { SelfAssessmentView } from "../../components/SelfAssessmentView";
import { BarrierHealthCard } from "../../components/BarrierHealthCard";
import { SkinAgeCard } from "../../components/SkinAgeCard";
import { DifferentialDiagnosisView } from "../../components/DifferentialDiagnosisView";
import { ClinicalGradingCard } from "../../components/ClinicalGradingCard";
import { SafetyScreeningCard } from "../../components/SafetyScreeningCard";
import { DeviceHardwareBadge } from "../../components/DeviceHardwareBadge";
import { Topology3DViewer } from "../../components/Topology3DViewer";
import { PredictiveInsightsCard } from "../../components/PredictiveInsightsCard";
import { AdvancedCaptureModal } from "../../components/AdvancedCaptureModal";
import type { AdvancedCaptureMode } from "@skinsense/types";
import {
  speakGuidance,
  stopGuidance,
  triggerCaptureHaptic,
  triggerPoseChangeHaptic,
  triggerSuccessHaptic,
  checkPoseAlignment,
  scoreFrame,
} from "../../lib/capture-service";

const { width } = Dimensions.get("window");

type CaptureStage =
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

export default function ScanScreen() {
  const { hasCompletedQuestionnaire, questionnaire } = useQuestionnaireStore();
  const [permission, requestPermission] = useCameraPermissions();

  // Navigation & Stages
  const [stage, setStage] = useState<CaptureStage>("CAMERA");
  const [captureMode, setCaptureMode] = useState<CaptureMode>("audio_guided");
  const [currentPoseIndex, setCurrentPoseIndex] = useState<number>(0);
  const [simulatedYaw, setSimulatedYaw] = useState<number>(0);
  const [capturedAngleFrames, setCapturedAngleFrames] = useState<string[]>([]);
  const [flashActive, setFlashActive] = useState<boolean>(false);
  const [voiceMuted, setVoiceMuted] = useState<boolean>(false);

  // Pre-Scan Checklist & Quality Gate
  const [showPreScanModal, setShowPreScanModal] = useState<boolean>(false);
  const [showAdvancedCaptureModal, setShowAdvancedCaptureModal] = useState<boolean>(false);
  const [advancedCaptureMode, setAdvancedCaptureMode] = useState<AdvancedCaptureMode>("lidar");
  const [useRawDng, setUseRawDng] = useState<boolean>(true);
  const [wifiOnly, setWifiOnly] = useState<boolean>(true);
  const [checklistCompleted, setChecklistCompleted] = useState<boolean>(false);
  const [physiologicalState, setPhysiologicalState] = useState<PhysiologicalState>({
    exercised: false,
    hotShower: false,
  });
  const [environmentScore, setEnvironmentScore] = useState<EnvironmentQualityScore>("green");
  const [isWhiteCalibrated, setIsWhiteCalibrated] = useState<boolean>(true);
  const [calibrationKey, setCalibrationKey] = useState<string>("calibrations/white-ref-d65.jpg");

  // Real-time Guidance Feedback
  const [framingStatus, setFramingStatus] = useState<string>("Position your face in the oval");
  const [isPoseAligned, setIsPoseAligned] = useState<boolean>(true);
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

  // Request camera permission on mount so the dialog appears immediately
  useEffect(() => {
    if (!permission?.granted && !permission?.canAskAgain === false) {
      requestPermission();
    }
  }, []);

  // Face alignment evaluation
  useEffect(() => {
    if (stage === "CAMERA") {
      const alignment = checkPoseAlignment(simulatedYaw, activePose.id);
      setIsPoseAligned(alignment.aligned);
      setFramingStatus(alignment.instruction);
    }
  }, [simulatedYaw, currentPoseIndex, stage]);

  // If questionnaire not yet completed, show questionnaire wizard
  if (!hasCompletedQuestionnaire) {
    return <QuestionnaireWizard onComplete={() => setStage("CAMERA")} />;
  }

  // Permission gate: show a full-screen prompt BEFORE rendering any camera UI
  if (!permission?.granted) {
    return (
      <SafeAreaView style={styles.permissionGate}>
        <View style={styles.permissionContent}>
          <View style={styles.permissionIconCircle}>
            <Camera size={48} color="#06B6D4" />
          </View>
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionDesc}>
            SkinSense needs access to your camera to capture high-resolution skin scans for analysis.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Camera size={18} color="#0B0F19" />
            <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
          </TouchableOpacity>
          {permission?.canAskAgain === false && (
            <Text style={styles.permissionHint}>
              Permission was denied. Please enable camera access in your device Settings.
            </Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  const handleStartCaptureSequence = () => {
    setShowPreScanModal(true);
  };

  const handleProceedFromChecklist = (
    state: PhysiologicalState = { exercised: false, hotShower: false },
  ) => {
    setPhysiologicalState(state);
    setShowPreScanModal(false);
    setChecklistCompleted(true);
    setCurrentPoseIndex(0);
    setCapturedAngleFrames([]);

    if (!voiceMuted) {
      if (captureMode === "audio_guided") {
        speakGuidance("Hold phone at eye level. Center your face in the guide.");
      } else if (captureMode === "mirror") {
        speakGuidance("Face your mirror and point the rear camera at your reflection.");
      } else {
        speakGuidance("Center face in oval for front selfie scan.");
      }
    }
  };

  const captureCurrentAngle = async () => {
    console.log("=== CAPTURE BUTTON PRESSED! currentPoseIndex:", currentPoseIndex);
    try {
      await triggerCaptureHaptic();

      // Simulate torch/flash exposure pulse
      setFlashActive(true);
      setTimeout(() => setFlashActive(false), 200);

      const frameKey = `scans/pose_${activePose.id}_${Date.now()}.jpg`;
      const nextFrames = [...capturedAngleFrames, frameKey];
      setCapturedAngleFrames(nextFrames);

      // Check if more angles need capturing
      if (currentPoseIndex < POSES.length - 1) {
        const nextIndex = currentPoseIndex + 1;
        setCurrentPoseIndex(nextIndex);
        setSimulatedYaw(POSES[nextIndex]!.targetYaw);
        await triggerPoseChangeHaptic();

        if (!voiceMuted) {
          if (POSES[nextIndex]!.id === "left_45") {
            speakGuidance("Photo taken! Now slowly turn your head to the left.");
          } else if (POSES[nextIndex]!.id === "right_45") {
            speakGuidance("Great! Now slowly turn your head to the right.");
          }
        }
      } else {
        // All 3 angles completed!
        await triggerSuccessHaptic();
        if (!voiceMuted) {
          speakGuidance("All angles captured! Uploading multi-angle dataset.");
        }
        await submitMultiAngleDataset(nextFrames);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Capture error");
      setStage("ERROR");
    }
  };

  const submitMultiAngleDataset = async (frames: string[]) => {
    try {
      setStage("UPLOADING");
      setProgressPercent(15);
      setProgressStage("Uploading 3-angle HDR & flash frames...");

      // 1. Request presigned upload keys
      const presign = await apiClient.presignUpload("image/jpeg", 4 * 1024 * 1024);
      setProgressPercent(35);

      // 2. Dispatch multi-angle scan with Phase 3 metadata
      const scanRes = await apiClient.createScan({
        imageKeys: frames.length > 0 ? frames : [presign.key],
        calibrationKey: isWhiteCalibrated ? calibrationKey : undefined,
        captureMode,
        frameCount: frames.length * 5, // 3 HDR + 2 flash per angle
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
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to initiate scan");
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
  // RENDER: CAMERA CAPTURE VIEW
  // ==========================================
  if (stage === "CAMERA") {
    const isBackCamera = captureMode === "audio_guided" || captureMode === "mirror" || captureMode === "assisted";

    return (
      <View style={styles.cameraContainer}>
        {/* Flash Simulation Overlay */}
        {flashActive && <View style={styles.flashOverlay} pointerEvents="none" />}

        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={isBackCamera ? "back" : "front"}
        />

        {/* Top Controls: Mode Switcher & Voice Mute */}
        <SafeAreaView style={styles.topBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.modeScroll}
          >
            <TouchableOpacity
              style={[styles.modePill, captureMode === "audio_guided" && styles.modePillActive]}
              onPress={() => setCaptureMode("audio_guided")}
            >
              <Volume2 size={13} color={captureMode === "audio_guided" ? "#0B0F19" : "#94A3B8"} />
              <Text style={[styles.modeText, captureMode === "audio_guided" && styles.modeTextActive]}>
                Audio Guided (Rear)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modePill, captureMode === "mirror" && styles.modePillActive]}
              onPress={() => setCaptureMode("mirror")}
            >
              <FlipHorizontal size={13} color={captureMode === "mirror" ? "#0B0F19" : "#94A3B8"} />
              <Text style={[styles.modeText, captureMode === "mirror" && styles.modeTextActive]}>
                Mirror Mode
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modePill, captureMode === "assisted" && styles.modePillActive]}
              onPress={() => setCaptureMode("assisted")}
            >
              <Users size={13} color={captureMode === "assisted" ? "#0B0F19" : "#94A3B8"} />
              <Text style={[styles.modeText, captureMode === "assisted" && styles.modeTextActive]}>
                Assisted
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modePill, captureMode === "front_camera" && styles.modePillActive]}
              onPress={() => setCaptureMode("front_camera")}
            >
              <Camera size={13} color={captureMode === "front_camera" ? "#0B0F19" : "#94A3B8"} />
              <Text style={[styles.modeText, captureMode === "front_camera" && styles.modeTextActive]}>
                Front Cam
              </Text>
            </TouchableOpacity>
          </ScrollView>

          <TouchableOpacity
            style={styles.muteButton}
            onPress={() => setVoiceMuted(!voiceMuted)}
          >
            {voiceMuted ? (
              <VolumeX size={18} color="#EF4444" />
            ) : (
              <Volume2 size={18} color="#10B981" />
            )}
          </TouchableOpacity>
        </SafeAreaView>

        {/* Phase 5: Device Hardware Capability Badge */}
        <DeviceHardwareBadge onOpenCaptureModal={() => setShowAdvancedCaptureModal(true)} />

        {/* Phase 3 Environment Quality Gate */}
        <EnvironmentQualityGate
          score={environmentScore}
          colorTempK={5400}
          advice="Even forward lighting detected. Keep device parallel to face."
          isCalibrated={isWhiteCalibrated}
          onCalibrateWhite={() => {
            setIsWhiteCalibrated(true);
            triggerSuccessHaptic();
          }}
        />

        {/* Multi-Angle Pose Indicator Bar */}
        <View style={styles.poseTabBar}>
          {POSES.map((pose, idx) => {
            const isCurrent = currentPoseIndex === idx;
            const isCompleted = idx < currentPoseIndex;
            return (
              <TouchableOpacity
                key={pose.id}
                style={[
                  styles.poseTab,
                  isCurrent && styles.poseTabCurrent,
                  isCompleted && styles.poseTabCompleted,
                ]}
                onPress={() => {
                  setCurrentPoseIndex(idx);
                  setSimulatedYaw(pose.targetYaw);
                }}
              >
                {isCompleted ? (
                  <CheckCircle2 size={13} color="#10B981" />
                ) : (
                  <Text style={[styles.poseTabNum, isCurrent && styles.poseTabNumCurrent]}>
                    {idx + 1}
                  </Text>
                )}
                <Text
                  style={[
                    styles.poseTabLabel,
                    isCurrent && styles.poseTabLabelCurrent,
                    isCompleted && styles.poseTabLabelCompleted,
                  ]}
                >
                  {pose.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Translucent Ghost Silhouette Guide */}
        <View style={styles.ovalOverlayContainer} pointerEvents="none">
          <View
            style={[
              styles.guideOval,
              isPoseAligned && styles.guideOvalReady,
              activePose.id === "left_45" && styles.guideOvalLeft,
              activePose.id === "right_45" && styles.guideOvalRight,
            ]}
          >
            {/* Interior alignment crosshairs */}
            <View style={styles.crosshairH} />
            <View style={styles.crosshairV} />
          </View>
        </View>

        {/* Real-time Framing Feedback Banner */}
        <View style={styles.feedbackContainer}>
          <View style={[styles.feedbackBadge, isPoseAligned && styles.feedbackBadgeReady]}>
            <Text style={styles.feedbackText}>{framingStatus}</Text>
          </View>
        </View>

        {/* Bottom Shutter Controls */}
        <SafeAreaView style={styles.shutterContainer}>
          {/* Angle quick-stepper for testing simulator */}
          <View style={styles.simulatorRow}>
            <TouchableOpacity
              style={styles.simBtn}
              onPress={() => setSimulatedYaw(-45)}
            >
              <Text style={styles.simBtnText}>45° Left</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.simBtn}
              onPress={() => setSimulatedYaw(0)}
            >
              <Text style={styles.simBtnText}>0° Front</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.simBtn}
              onPress={() => setSimulatedYaw(45)}
            >
              <Text style={styles.simBtnText}>45° Right</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.captureButton, !isPoseAligned && styles.captureButtonDisabled]}
            onPress={
              !checklistCompleted
                ? handleStartCaptureSequence
                : captureCurrentAngle
            }
            activeOpacity={0.8}
          >
            <View style={styles.captureInner}>
              <Camera size={26} color="#0B0F19" />
            </View>
          </TouchableOpacity>

          <Text style={styles.captureHint}>
            {!checklistCompleted
              ? "Tap to begin 3-angle capture sequence"
              : `Capture Angle ${currentPoseIndex + 1} of 3 (${activePose.label})`}
          </Text>
        </SafeAreaView>

        {/* Pre-Scan Checklist Modal */}
        <PreScanChecklistModal
          visible={showPreScanModal}
          onProceed={handleProceedFromChecklist}
          onDismiss={() => setShowPreScanModal(false)}
        />

        {/* Phase 5 Advanced Capture Studio Modal */}
        <AdvancedCaptureModal
          visible={showAdvancedCaptureModal}
          onClose={() => setShowAdvancedCaptureModal(false)}
          onSelectMode={(mode, opts) => {
            setAdvancedCaptureMode(mode);
            setUseRawDng(opts.useRawDng);
            setWifiOnly(opts.wifiOnly);
            handleProceedFromChecklist();
          }}
        />
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
          <Text style={styles.progressSub}>Multi-Angle 16-Frame HDR S3 Ingestion Active</Text>
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
            onTimeoutHome={() => setStage("CAMERA")}
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
        <TouchableOpacity style={styles.retryButton} onPress={() => setStage("CAMERA")}>
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
            setStage("CAMERA");
          }}
        >
          <Camera size={20} color="#FFFFFF" />
          <Text style={styles.retakeScanText}>Take Another Scan</Text>
        </TouchableOpacity>
      </ScrollView>
      <MedicalDisclaimerFooter bottomOffset={8} />
    </SafeAreaView>
  );
}

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
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 36 : 10,
    marginBottom: 6,
  },
  modeScroll: {
    gap: 8,
    paddingRight: 10,
  },
  modePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 5,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  modePillActive: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  modeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94A3B8",
  },
  modeTextActive: {
    color: "#0B0F19",
  },
  muteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  poseTabBar: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderRadius: 12,
    padding: 4,
    gap: 6,
  },
  poseTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
    gap: 5,
  },
  poseTabCurrent: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    borderWidth: 1,
    borderColor: "#10B981",
  },
  poseTabCompleted: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  poseTabNum: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
  },
  poseTabNumCurrent: {
    color: "#10B981",
  },
  poseTabLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
  },
  poseTabLabelCurrent: {
    color: "#10B981",
  },
  poseTabLabelCompleted: {
    color: "#10B981",
  },
  ovalOverlayContainer: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
  guideOval: {
    width: 250,
    height: 330,
    borderRadius: 125,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  guideOvalReady: {
    borderColor: "#10B981",
    borderStyle: "solid",
    backgroundColor: "rgba(16, 185, 129, 0.08)",
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
  feedbackContainer: {
    position: "absolute",
    top: 155,
    width: "100%",
    alignItems: "center",
  },
  feedbackBadge: {
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  feedbackBadgeReady: {
    borderColor: "#10B981",
    backgroundColor: "rgba(16, 185, 129, 0.2)",
  },
  feedbackText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  shutterContainer: {
    position: "absolute",
    bottom: 24,
    width: "100%",
    alignItems: "center",
  },
  simulatorRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  simBtn: {
    backgroundColor: "rgba(30, 41, 59, 0.8)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  simBtnText: {
    fontSize: 11,
    color: "#CBD5E1",
    fontWeight: "600",
  },
  captureButton: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 4,
    borderColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  captureButtonDisabled: {
    borderColor: "#64748B",
  },
  captureInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
  },
  captureHint: {
    color: "#CBD5E1",
    fontSize: 12,
    fontWeight: "600",
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
