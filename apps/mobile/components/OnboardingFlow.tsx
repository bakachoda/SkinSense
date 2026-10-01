import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import {
  ShieldAlert,
  Camera,
  Image as ImageIcon,
  Bell,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Layers,
} from "lucide-react-native";
import { DISCLAIMER_FULL } from "@skinsense/types";
import { useOnboardingStore } from "../stores/onboarding";
import { apiClient } from "../lib/api-client";

interface OnboardingFlowProps {
  onComplete: () => void;
  initialStep?: 1 | 2 | 3;
}

export function OnboardingFlow({ onComplete, initialStep = 1 }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(initialStep);
  const [activeSlide, setActiveSlide] = useState(0);
  const [hasCheckedDisclaimer, setHasCheckedDisclaimer] = useState(false);
  const [cameraGranted, setCameraGranted] = useState(false);
  const [photosGranted, setPhotosGranted] = useState(false);
  const [notifsGranted, setNotifsGranted] = useState(false);

  const acknowledgeDisclaimer = useOnboardingStore((s) => s.acknowledgeDisclaimer);
  const setHasSeenWelcome = useOnboardingStore((s) => s.setHasSeenWelcome);
  const setPermissionsCompleted = useOnboardingStore((s) => s.setPermissionsCompleted);

  // ──────────────────────────────────────────────
  // Step 1: App Intro Carousel
  // ──────────────────────────────────────────────
  const slides = [
    {
      title: "Real-time AI Face Scan",
      desc: "Instant facial zone segmentation with adaptive lighting and framing guidance.",
      icon: <Camera size={44} color="#06b6d4" />,
    },
    {
      title: "6-Zone Condition Mapping",
      desc: "Quantifies acne, redness, pigmentation, texture, dryness, and oiliness.",
      icon: <Layers size={44} color="#3b82f6" />,
    },
    {
      title: "Conflict-Free Routines",
      desc: "Custom AM/PM formulas tailored to your skin type, allergies, and pregnancy safety.",
      icon: <Sparkles size={44} color="#10b981" />,
    },
  ];

  const handleNextStep1 = () => {
    if (activeSlide < slides.length - 1) {
      setActiveSlide(activeSlide + 1);
    } else {
      setHasSeenWelcome(true);
      setCurrentStep(2);
    }
  };

  const handleSkipToDisclaimer = () => {
    setHasSeenWelcome(true);
    setCurrentStep(2);
  };

  // ──────────────────────────────────────────────
  // Step 2: Medical Disclaimer
  // ──────────────────────────────────────────────
  const handleAgreeDisclaimer = async () => {
    if (!hasCheckedDisclaimer) return;
    acknowledgeDisclaimer(1);
    try {
      await apiClient.acknowledgeDisclaimer(1);
    } catch (e) {
      console.warn("Could not sync disclaimer acknowledgment to backend:", e);
    }
    setCurrentStep(3);
  };

  // ──────────────────────────────────────────────
  // Step 3: Permissions
  // ──────────────────────────────────────────────
  const handleRequestCamera = async () => {
    setCameraGranted(true);
  };

  const handleRequestPhotos = async () => {
    setPhotosGranted(true);
  };

  const handleRequestNotifications = async () => {
    setNotifsGranted(true);
  };

  const handleFinishOnboarding = () => {
    setPermissionsCompleted(true);
    onComplete();
  };

  return (
    <View style={styles.container}>
      {/* ── SCREEN 1: WELCOME INTRO ── */}
      {currentStep === 1 && (
        <View style={styles.screenContent}>
          <View style={styles.topBar}>
            <View style={styles.stepIndicator}>
              <Text style={styles.stepIndicatorText}>Step 1 of 3</Text>
            </View>
            <TouchableOpacity
              onPress={handleSkipToDisclaimer}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityLabel="Skip to medical disclaimer"
            >
              <Text style={styles.skipLink}>Skip</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.heroWrapper}>
            <View style={styles.iconCircle}>{slides[activeSlide]?.icon}</View>
            <Text style={styles.heroHeadline}>Your skin, understood.</Text>
            <Text style={styles.heroBody}>
              SkinSense uses AI to analyze your skin, spot concerns early, and build a routine that actually works — all from your phone&apos;s camera.
            </Text>

            {/* Feature card */}
            <View style={styles.featureCard}>
              <Text style={styles.featureCardTitle}>{slides[activeSlide]?.title}</Text>
              <Text style={styles.featureCardDesc}>{slides[activeSlide]?.desc}</Text>
            </View>

            {/* Dots */}
            <View style={styles.dotsRow}>
              {slides.map((_, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setActiveSlide(i)}
                  style={[styles.dot, activeSlide === i && styles.dotActive]}
                />
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleNextStep1}
            accessibilityLabel="Next welcome slide"
          >
            <Text style={styles.primaryBtnText}>
              {activeSlide < slides.length - 1 ? "Next" : "Continue to Disclaimer"}
            </Text>
            <ArrowRight size={18} color="#0f172a" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      )}

      {/* ── SCREEN 2: MANDATORY MEDICAL DISCLAIMER ── */}
      {currentStep === 2 && (
        <View style={styles.screenContent}>
          <View style={styles.topBar}>
            <View style={styles.stepIndicator}>
              <Text style={styles.stepIndicatorText}>Step 2 of 3</Text>
            </View>
            {/* NO SKIP LINK ON SCREEN 2 PER SPEC */}
          </View>

          <ScrollView style={styles.disclaimerScroll} contentContainerStyle={styles.disclaimerContent}>
            <View style={styles.shieldWrapper}>
              <ShieldAlert size={52} color="#f59e0b" />
            </View>

            <Text style={styles.disclaimerHeadline}>Important: This Is Not Medical Advice</Text>

            <View style={styles.disclaimerCard}>
              <Text style={styles.disclaimerText}>{DISCLAIMER_FULL}</Text>
            </View>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setHasCheckedDisclaimer(!hasCheckedDisclaimer)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: hasCheckedDisclaimer }}
              accessibilityLabel="I understand this is not a medical diagnosis."
            >
              <View style={[styles.checkbox, hasCheckedDisclaimer && styles.checkboxChecked]}>
                {hasCheckedDisclaimer && <CheckCircle size={18} color="#06b6d4" />}
              </View>
              <Text style={styles.checkboxLabel}>
                I understand this is not a medical diagnosis.
              </Text>
            </TouchableOpacity>
          </ScrollView>

          <TouchableOpacity
            style={[styles.primaryBtn, !hasCheckedDisclaimer && styles.primaryBtnDisabled]}
            disabled={!hasCheckedDisclaimer}
            onPress={handleAgreeDisclaimer}
            accessibilityLabel="I Agree to medical disclaimer"
          >
            <Text style={[styles.primaryBtnText, !hasCheckedDisclaimer && styles.primaryBtnTextDisabled]}>
              I Agree
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── SCREEN 3: PERMISSION REQUESTS ── */}
      {currentStep === 3 && (
        <View style={styles.screenContent}>
          <View style={styles.topBar}>
            <View style={styles.stepIndicator}>
              <Text style={styles.stepIndicatorText}>Step 3 of 3</Text>
            </View>
          </View>

          <ScrollView style={styles.permissionsScroll} contentContainerStyle={styles.permissionsContent}>
            <Text style={styles.permissionsHeadline}>Device Permissions</Text>
            <Text style={styles.permissionsSubtitle}>
              SkinSense needs these permissions to provide a seamless skin analysis and habit-building experience.
            </Text>

            {/* Permission 1: Camera */}
            <View style={styles.permCard}>
              <View style={styles.permIconWrapper}>
                <Camera size={24} color="#06b6d4" />
              </View>
              <View style={styles.permInfo}>
                <Text style={styles.permTitle}>Camera</Text>
                <Text style={styles.permDesc}>
                  SkinSense needs your camera to scan your skin. No photos leave your device until you choose to upload.
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.permBtn, cameraGranted && styles.permBtnGranted]}
                onPress={handleRequestCamera}
                accessibilityLabel="Enable Camera"
              >
                <Text style={styles.permBtnText}>{cameraGranted ? "Granted" : "Enable"}</Text>
              </TouchableOpacity>
            </View>

            {/* Permission 2: Photo Library */}
            <View style={styles.permCard}>
              <View style={styles.permIconWrapper}>
                <ImageIcon size={24} color="#3b82f6" />
              </View>
              <View style={styles.permInfo}>
                <Text style={styles.permTitle}>Photo Library</Text>
                <Text style={styles.permDesc}>
                  Optionally upload an existing photo for analysis instead of taking a new one.
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.permBtn, photosGranted && styles.permBtnGranted]}
                onPress={handleRequestPhotos}
                accessibilityLabel="Enable Photos"
              >
                <Text style={styles.permBtnText}>{photosGranted ? "Granted" : "Enable"}</Text>
              </TouchableOpacity>
            </View>

            {/* Permission 3: Notifications */}
            <View style={styles.permCard}>
              <View style={styles.permIconWrapper}>
                <Bell size={24} color="#10b981" />
              </View>
              <View style={styles.permInfo}>
                <Text style={styles.permTitle}>Notifications</Text>
                <Text style={styles.permDesc}>
                  We&apos;ll remind you to apply your AM and PM routine and let you know when it&apos;s time for a progress scan.
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.permBtn, notifsGranted && styles.permBtnGranted]}
                onPress={handleRequestNotifications}
                accessibilityLabel="Enable Notifications"
              >
                <Text style={styles.permBtnText}>{notifsGranted ? "Granted" : "Enable"}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleFinishOnboarding}
            accessibilityLabel="Get Started with questionnaire"
          >
            <Text style={styles.primaryBtnText}>Get Started</Text>
            <ArrowRight size={18} color="#0f172a" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0f19",
  },
  screenContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 54 : 32,
    paddingBottom: 24,
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  stepIndicator: {
    backgroundColor: "#1e293b",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  stepIndicatorText: {
    color: "#06b6d4",
    fontSize: 12,
    fontWeight: "600",
  },
  skipLink: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "500",
  },
  heroWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  heroHeadline: {
    color: "#f8fafc",
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 10,
  },
  heroBody: {
    color: "#94a3b8",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
    maxWidth: 320,
  },
  featureCard: {
    backgroundColor: "#1e293b",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#334155",
    width: "100%",
    marginBottom: 20,
  },
  featureCardTitle: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  featureCardDesc: {
    color: "#94a3b8",
    fontSize: 13,
    lineHeight: 18,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#334155",
  },
  dotActive: {
    width: 24,
    backgroundColor: "#06b6d4",
  },

  disclaimerScroll: {
    flex: 1,
  },
  disclaimerContent: {
    alignItems: "center",
    paddingBottom: 24,
  },
  shieldWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    marginTop: 12,
  },
  disclaimerHeadline: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 16,
  },
  disclaimerCard: {
    backgroundColor: "#1e293b",
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
    marginBottom: 20,
    width: "100%",
  },
  disclaimerText: {
    color: "#cbd5e1",
    fontSize: 13,
    lineHeight: 20,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#131c2e",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 12,
    padding: 14,
    width: "100%",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#475569",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkboxChecked: {
    borderColor: "#06b6d4",
    backgroundColor: "rgba(6, 182, 212, 0.1)",
  },
  checkboxLabel: {
    color: "#f8fafc",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },

  permissionsScroll: {
    flex: 1,
  },
  permissionsContent: {
    paddingBottom: 20,
  },
  permissionsHeadline: {
    color: "#f8fafc",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 6,
  },
  permissionsSubtitle: {
    color: "#94a3b8",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  permCard: {
    backgroundColor: "#1e293b",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  permIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  permInfo: {
    flex: 1,
    marginRight: 10,
  },
  permTitle: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  permDesc: {
    color: "#94a3b8",
    fontSize: 12,
    lineHeight: 16,
  },
  permBtn: {
    backgroundColor: "#334155",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  permBtnGranted: {
    backgroundColor: "#065f46",
  },
  permBtnText: {
    color: "#f8fafc",
    fontSize: 12,
    fontWeight: "700",
  },

  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#06b6d4",
    paddingVertical: 15,
    borderRadius: 14,
    marginTop: 12,
  },
  primaryBtnDisabled: {
    backgroundColor: "#1e293b",
    opacity: 0.5,
  },
  primaryBtnText: {
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "700",
  },
  primaryBtnTextDisabled: {
    color: "#64748b",
  },
});
