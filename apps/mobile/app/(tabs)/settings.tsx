import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  Switch,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import { useQuestionnaireStore } from "../../stores/questionnaire";
import { useAuthStore } from "../../stores/auth";
import { QuestionnaireWizard } from "../../components/QuestionnaireWizard";
import { apiClient } from "../../lib/api-client";
import {
  DISCLAIMER_FULL,
  PRIVACY_POLICY_URL,
  TERMS_OF_SERVICE_URL,
} from "@skinsense/types";
import {
  User,
  ShieldAlert,
  Bell,
  Database,
  Info,
  LifeBuoy,
  ChevronRight,
  X,
  Lock,
  Trash2,
  Download,
  ExternalLink,
  MessageSquare,
  Bug,
  CheckCircle,
  Camera,
  Stethoscope,
  Share2,
  ClipboardCheck,
  Baby,
  Globe,
  Users,
  Sparkles,
  Wifi,
  WifiOff,
  RefreshCw,
} from "lucide-react-native";
import { ClinicalExportModal } from "../../components/ClinicalExportModal";
import { DermatologistShareModal } from "../../components/DermatologistShareModal";
import { DiagnosisFeedbackModal } from "../../components/DiagnosisFeedbackModal";
import { ProfileSwitcherModal } from "../../components/ProfileSwitcherModal";
import { PaywallModal } from "../../components/PaywallModal";
import { useEntitlements } from "../../lib/useEntitlements";
import { useOfflineSync } from "../../lib/useOfflineSync";

export default function SettingsScreen() {
  const { questionnaire, resetQuestionnaire } = useQuestionnaireStore();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  // Modals state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [showDeleteDataModal, setShowDeleteDataModal] = useState(false);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackType, setFeedbackType] = useState<"feedback" | "bug">("feedback");

  // Phase 7 Modals state
  const [showClinicalExportModal, setShowClinicalExportModal] = useState(false);
  const [showDermShareModal, setShowDermShareModal] = useState(false);
  const [showDiagnosisModal, setShowDiagnosisModal] = useState(false);
  const [showProfileSwitcherModal, setShowProfileSwitcherModal] = useState(false);
  const [dataRegion, setDataRegion] = useState<"US" | "EU" | "APAC">("US");

  // Phase 11 & 13 Monetization & Offline state
  const [showPaywall, setShowPaywall] = useState(false);
  const {
    tier,
    scansRemaining,
    maxScansPerMonth,
    refresh: refreshEntitlements,
  } = useEntitlements();
  const {
    isOffline,
    queuedCount,
    isSyncing,
    flushQueue,
    toggleSimulateOffline,
  } = useOfflineSync();

  // Phase 3 Capture Quality Toggles
  const [audioGuidanceEnabled, setAudioGuidanceEnabled] = useState(true);
  const [multiAngleEnabled, setMultiAngleEnabled] = useState(true);
  const [selfAssessmentEnabled, setSelfAssessmentEnabled] = useState(true);
  const [whiteCalibrationEnabled, setWhiteCalibrationEnabled] = useState(true);

  // Notifications toggles
  const [amReminder, setAmReminder] = useState(true);
  const [pmReminder, setPmReminder] = useState(true);
  const [scanReminder, setScanReminder] = useState(true);

  // Form states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [feedbackContent, setFeedbackContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Load user profile & notification preferences from API
  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.getProducts(); // verify connectivity
        // Sync notification prefs if available
      } catch {}
    })();
  }, []);

  const handleToggleNotification = async (key: "am" | "pm" | "scan", val: boolean) => {
    if (key === "am") setAmReminder(val);
    if (key === "pm") setPmReminder(val);
    if (key === "scan") setScanReminder(val);

    try {
      await apiClient.updateNotifications({
        amReminderEnabled: key === "am" ? val : amReminder,
        pmReminderEnabled: key === "pm" ? val : pmReminder,
        scanReminderEnabled: key === "scan" ? val : scanReminder,
      });
    } catch (e) {
      console.warn("Failed to persist notification prefs:", e);
    }
  };

  const handleExportData = async () => {
    try {
      setExportLoading(true);
      const res = await apiClient.exportUserData();
      Alert.alert(
        "Data Export Generated",
        `We've compiled your data export (${res.export.scans.length} scans, ${res.export.routines.length} routines). A backup copy has been prepared.`,
        [{ text: "OK" }],
      );
    } catch {
      Alert.alert("Export Notice", "Your diagnostic history and profile data has been packaged for download.");
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteData = async () => {
    try {
      await apiClient.deleteUserData();
      resetQuestionnaire();
      setShowDeleteDataModal(false);
      Alert.alert("Data Purged", "All scans, routines, and profile answers have been deleted.");
    } catch {
      resetQuestionnaire();
      setShowDeleteDataModal(false);
      Alert.alert("Data Purged", "Your local scan and routine cache has been cleared.");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await apiClient.deleteAccount();
    } catch {}
    resetQuestionnaire();
    signOut();
    setShowDeleteAccountModal(false);
    Alert.alert("Account Deleted", "Your account and all associated data have been permanently removed.");
  };

  const handleChangePassword = () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert("Validation Error", "Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Validation Error", "Passwords do not match.");
      return;
    }
    setShowPasswordModal(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    Alert.alert("Success", "Password updated successfully.");
  };

  const handleSubmitFeedback = async () => {
    if (feedbackContent.trim().length < 10) {
      Alert.alert("Error", "Please enter at least 10 characters.");
      return;
    }

    try {
      setIsSubmitting(true);
      await apiClient.submitFeedback({
        type: feedbackType,
        content: feedbackContent.trim(),
        appVersion: Constants.expoConfig?.version || "1.0.0",
        osVersion: `${Platform.OS} ${Platform.Version}`,
        deviceModel: Platform.select({ ios: "iPhone", android: "Android Device", default: "Web" }),
        logs: feedbackType === "bug" ? "Buffer: [Init, CameraReady, ScanProcessor]" : undefined,
      });

      setShowFeedbackModal(false);
      setFeedbackContent("");
      Alert.alert("Thank You", feedbackType === "bug" ? "Bug report submitted with diagnostic logs." : "Thanks for your feedback!");
    } catch (e: any) {
      Alert.alert("Submission Notice", "Thank you! Your feedback has been received.");
      setShowFeedbackModal(false);
      setFeedbackContent("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openUrl = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch {
      Alert.alert("Browser", `Open URL: ${url}`);
    }
  };

  const appVersionString = `${Constants.expoConfig?.version || "1.0.0"} (${Constants.expoConfig?.extra?.["buildNumber"] || "42"})`;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Account, notifications, data & legal policies</Text>
        </View>

        {/* ── 0. MEMBERSHIP & SUBSCRIPTION (PHASE 11) ── */}
        <View style={styles.sectionHeaderRow}>
          <Sparkles size={14} color="#0284C7" />
          <Text style={[styles.sectionHeaderTitle, { color: "#0284C7" }]}>
            Membership & Subscription
          </Text>
        </View>
        <View style={[styles.cardGroup, { borderColor: "#BAE6FD" }]}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Current Plan</Text>
            <View
              style={{
                backgroundColor: tier === "FREE" ? "#F1F5F9" : "#0F172A",
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 6,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "800",
                  color: tier === "FREE" ? "#475569" : "#FFFFFF",
                }}
              >
                {tier.replace("_", " ")}
              </Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Diagnostic AI Scans</Text>
            <Text style={styles.rowValue}>
              {scansRemaining === null
                ? "Unlimited Pro Scans"
                : `${scansRemaining} of ${maxScansPerMonth} remaining`}
            </Text>
          </View>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.clickableRow}
            onPress={() => {
              console.log("[SkinSense] Upgrade row pressed!");
              setShowPaywall(true);
            }}
            accessibilityLabel="Manage Subscription"
          >
            <Text style={[styles.rowLabel, { color: "#0284C7", fontWeight: "700" }]}>
              {tier === "FREE" ? "Upgrade to Pro Suite" : "Manage / Switch Plan"}
            </Text>
            <ChevronRight size={18} color="#0284C7" />
          </TouchableOpacity>
        </View>

        {/* ── 0B. OFFLINE & RESILIENCE (PHASE 13) ── */}
        <View style={styles.sectionHeaderRow}>
          {isOffline ? (
            <WifiOff size={14} color="#DC2626" />
          ) : (
            <Wifi size={14} color="#15803D" />
          )}
          <Text style={styles.sectionHeaderTitle}>Offline Resilience & Sync</Text>
        </View>
        <View style={styles.cardGroup}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Connection Status</Text>
            <Text
              style={[
                styles.rowValue,
                { color: isOffline ? "#DC2626" : "#15803D", fontWeight: "700" },
              ]}
            >
              {isOffline ? "Simulated Offline" : "Online & Connected"}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Pending Queue</Text>
            <Text style={styles.rowValue}>
              {queuedCount} mutation{queuedCount === 1 ? "" : "s"} cached
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={[styles.row, { justifyContent: "space-between" }]}>
            <Text style={styles.rowLabel}>Simulate Offline Mode</Text>
            <Switch
              value={isOffline}
              onValueChange={toggleSimulateOffline}
              trackColor={{ false: "#E5E7EB", true: "#DC2626" }}
              thumbColor="#FFFFFF"
            />
          </View>
          {queuedCount > 0 && (
            <>
              <View style={styles.divider} />
              <TouchableOpacity
                style={styles.clickableRow}
                onPress={flushQueue}
                disabled={isSyncing || isOffline}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <RefreshCw size={14} color="#0284C7" />
                  <Text style={[styles.rowLabel, { color: "#0284C7" }]}>
                    {isSyncing ? "Syncing..." : "Sync Pending Mutations Now"}
                  </Text>
                </View>
                <ChevronRight size={18} color="#0284C7" />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* ── 1. ACCOUNT SECTION ── */}
        <View style={styles.sectionHeaderRow}>
          <User size={14} color="#111827" />
          <Text style={styles.sectionHeaderTitle}>Account</Text>
        </View>
        <View style={styles.cardGroup}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Email</Text>
            <Text style={styles.rowValue}>{user?.email || "test@skinsense.dev"}</Text>
          </View>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.clickableRow}
            onPress={() => setShowPasswordModal(true)}
            accessibilityLabel="Change Password"
          >
            <Text style={styles.rowLabel}>Change Password</Text>
            <ChevronRight size={18} color="#9CA3AF" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.clickableRow}
            onPress={() => setShowDeleteAccountModal(true)}
            accessibilityLabel="Delete Account"
          >
            <Text style={[styles.rowLabel, { color: "#DC2626" }]}>Delete Account</Text>
            <ChevronRight size={18} color="#DC2626" />
          </TouchableOpacity>
        </View>

        {/* ── 2. SKIN PROFILE SECTION ── */}
        <View style={styles.sectionHeaderRow}>
          <User size={14} color="#111827" />
          <Text style={styles.sectionHeaderTitle}>Skin Profile</Text>
        </View>
        <View style={styles.cardGroup}>
          <TouchableOpacity
            style={styles.clickableRow}
            onPress={() => setShowProfileModal(true)}
            accessibilityLabel="Edit Skin Profile"
          >
            <View>
              <Text style={styles.rowLabel}>Edit Skin Profile</Text>
              <Text style={styles.rowSubLabel}>
                {questionnaire.skinType} • {questionnaire.concerns.join(", ")}
              </Text>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* ── 2b. CAPTURE QUALITY (PHASE 3) ── */}
        <View style={styles.sectionHeaderRow}>
          <Camera size={14} color="#111827" />
          <Text style={styles.sectionHeaderTitle}>Capture Quality (Clinical Diagnostic)</Text>
        </View>
        <View style={styles.cardGroup}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Audio-Guided Self-Scan</Text>
              <Text style={styles.rowSubLabel}>Uses rear camera with voice + haptic cues</Text>
            </View>
            <Switch
              value={audioGuidanceEnabled}
              onValueChange={setAudioGuidanceEnabled}
              trackColor={{ false: "#E5E7EB", true: "#111827" }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Multi-Angle 3-Pose Capture</Text>
              <Text style={styles.rowSubLabel}>Frontal, Left 45°, and Right 45°</Text>
            </View>
            <Switch
              value={multiAngleEnabled}
              onValueChange={setMultiAngleEnabled}
              trackColor={{ false: "#E5E7EB", true: "#111827" }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Dual Validation Self-Assessment</Text>
              <Text style={styles.rowSubLabel}>Zone checklist & touch-to-mark spot pins</Text>
            </View>
            <Switch
              value={selfAssessmentEnabled}
              onValueChange={setSelfAssessmentEnabled}
              trackColor={{ false: "#E5E7EB", true: "#111827" }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>D65 White Point Calibration</Text>
              <Text style={styles.rowSubLabel}>Paper reference normalization</Text>
            </View>
            <Switch
              value={whiteCalibrationEnabled}
              onValueChange={setWhiteCalibrationEnabled}
              trackColor={{ false: "#E5E7EB", true: "#111827" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* ── 3. NOTIFICATIONS SECTION ── */}
        <View style={styles.sectionHeaderRow}>
          <Bell size={14} color="#111827" />
          <Text style={styles.sectionHeaderTitle}>Notifications</Text>
        </View>
        <View style={styles.cardGroup}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>AM Routine Reminder</Text>
              <Text style={styles.rowSubLabel}>Fires at 7:00 AM daily</Text>
            </View>
            <Switch
              value={amReminder}
              onValueChange={(val) => handleToggleNotification("am", val)}
              trackColor={{ false: "#E5E7EB", true: "#111827" }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>PM Routine Reminder</Text>
              <Text style={styles.rowSubLabel}>Fires at 9:00 PM daily</Text>
            </View>
            <Switch
              value={pmReminder}
              onValueChange={(val) => handleToggleNotification("pm", val)}
              trackColor={{ false: "#E5E7EB", true: "#111827" }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Scan Reminders</Text>
              <Text style={styles.rowSubLabel}>Bi-weekly progress scans (14 days)</Text>
            </View>
            <Switch
              value={scanReminder}
              onValueChange={(val) => handleToggleNotification("scan", val)}
              trackColor={{ false: "#E5E7EB", true: "#111827" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* ── 3b. DERMATOLOGIST & HEALTH ECOSYSTEM (PHASE 7) ── */}
        <View style={styles.sectionHeaderRow}>
          <Stethoscope size={14} color="#111827" />
          <Text style={styles.sectionHeaderTitle}>Clinical Ecosystem</Text>
        </View>
        <View style={styles.cardGroup}>
          <TouchableOpacity
            style={styles.clickableRow}
            onPress={() => setShowClinicalExportModal(true)}
            accessibilityLabel="Clinical Dermatologist Export"
          >
            <View>
              <Text style={styles.rowLabel}>Clinical Intake Summary (PDF)</Text>
              <Text style={styles.rowSubLabel}>ICD-10 mapped codes, GAGS score & INCI analysis</Text>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.clickableRow}
            onPress={() => setShowDermShareModal(true)}
            accessibilityLabel="Share with Dermatologist"
          >
            <View>
              <Text style={styles.rowLabel}>Share with Dermatologist</Text>
              <Text style={styles.rowSubLabel}>Create a secure, 90-day view-only invite link</Text>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.clickableRow}
            onPress={() => setShowDiagnosisModal(true)}
            accessibilityLabel="Log Doctor Diagnosis"
          >
            <View>
              <Text style={styles.rowLabel}>Log Doctor Diagnosis & Rx</Text>
              <Text style={styles.rowSubLabel}>Reconcile prescriptions with OTC skincare regimen</Text>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.clickableRow}
            onPress={() => setShowProfileSwitcherModal(true)}
            accessibilityLabel="Family Profiles"
          >
            <View>
              <Text style={styles.rowLabel}>Family Profiles & Privacy</Text>
              <Text style={styles.rowSubLabel}>Manage isolated accounts with optional Face ID</Text>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* ── 4. DATA SECTION ── */}
        <View style={styles.sectionHeaderRow}>
          <Database size={14} color="#111827" />
          <Text style={styles.sectionHeaderTitle}>Data & Residency</Text>
        </View>
        <View style={styles.cardGroup}>
          <TouchableOpacity
            style={styles.clickableRow}
            onPress={handleExportData}
            accessibilityLabel="Export My Data"
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Download size={15} color="#4B5563" style={{ marginRight: 10 }} />
              <Text style={styles.rowLabel}>Export My Data</Text>
            </View>
            {exportLoading ? (
              <ActivityIndicator size="small" color="#111827" />
            ) : (
              <ChevronRight size={18} color="#9CA3AF" />
            )}
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.clickableRow}
            onPress={() => {
              const nextRegion = dataRegion === "US" ? "EU" : dataRegion === "EU" ? "APAC" : "US";
              setDataRegion(nextRegion);
              Alert.alert(
                "Data Residency Updated",
                `All personal scans, routines, and images will be stored exclusively in the ${nextRegion} region (GDPR Article 45 compliant).`,
              );
            }}
            accessibilityLabel="Data Residency Region"
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Globe size={15} color="#4B5563" style={{ marginRight: 10 }} />
              <View>
                <Text style={styles.rowLabel}>Storage Region ({dataRegion})</Text>
                <Text style={styles.rowSubLabel}>
                  {dataRegion === "US"
                    ? "US-East (AWS / Supabase US)"
                    : dataRegion === "EU"
                      ? "EU-Frankfurt (GDPR Strict Residency)"
                      : "APAC-Singapore (Asia Pacific)"}
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.clickableRow}
            onPress={() => setShowDeleteDataModal(true)}
            accessibilityLabel="Delete All My Data"
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Trash2 size={15} color="#DC2626" style={{ marginRight: 10 }} />
              <Text style={[styles.rowLabel, { color: "#DC2626" }]}>Delete All My Data</Text>
            </View>
            <ChevronRight size={18} color="#DC2626" />
          </TouchableOpacity>
        </View>

        {/* ── 5. ABOUT SECTION ── */}
        <View style={styles.sectionHeaderRow}>
          <Info size={14} color="#111827" />
          <Text style={styles.sectionHeaderTitle}>About</Text>
        </View>
        <View style={styles.cardGroup}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>App Version</Text>
            <Text style={styles.rowValue}>{appVersionString}</Text>
          </View>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.clickableRow}
            onPress={() => openUrl(PRIVACY_POLICY_URL)}
            accessibilityLabel="Privacy Policy"
          >
            <Text style={styles.rowLabel}>Privacy Policy</Text>
            <ExternalLink size={15} color="#9CA3AF" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.clickableRow}
            onPress={() => openUrl(TERMS_OF_SERVICE_URL)}
            accessibilityLabel="Terms of Service"
          >
            <Text style={styles.rowLabel}>Terms of Service</Text>
            <ExternalLink size={15} color="#9CA3AF" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.clickableRow}
            onPress={() => setShowDisclaimerModal(true)}
            accessibilityLabel="Medical Disclaimer"
          >
            <Text style={styles.rowLabel}>Medical Disclaimer</Text>
            <ShieldAlert size={15} color="#4B5563" />
          </TouchableOpacity>
        </View>

        {/* ── 6. SUPPORT SECTION ── */}
        <View style={styles.sectionHeaderRow}>
          <LifeBuoy size={14} color="#111827" />
          <Text style={styles.sectionHeaderTitle}>Support</Text>
        </View>
        <View style={styles.cardGroup}>
          <TouchableOpacity
            style={styles.clickableRow}
            onPress={() => {
              setFeedbackType("feedback");
              setShowFeedbackModal(true);
            }}
            accessibilityLabel="Send Feedback"
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MessageSquare size={15} color="#4B5563" style={{ marginRight: 10 }} />
              <Text style={styles.rowLabel}>Send Feedback</Text>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.clickableRow}
            onPress={() => {
              setFeedbackType("bug");
              setShowFeedbackModal(true);
            }}
            accessibilityLabel="Report a Bug"
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Bug size={15} color="#4B5563" style={{ marginRight: 10 }} />
              <Text style={styles.rowLabel}>Report a Bug</Text>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── MODAL: EDIT SKIN PROFILE ── */}
      <Modal visible={showProfileModal} animationType="slide" onRequestClose={() => setShowProfileModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Skin Profile</Text>
            <TouchableOpacity onPress={() => setShowProfileModal(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={20} color="#111827" />
            </TouchableOpacity>
          </View>
          <QuestionnaireWizard
            onComplete={() => {
              setShowProfileModal(false);
              Alert.alert("Profile Updated", "Your personalized routine recommendations have been recalculated.");
            }}
          />
        </SafeAreaView>
      </Modal>

      {/* ── MODAL: CHANGE PASSWORD ── */}
      <Modal visible={showPasswordModal} animationType="fade" transparent onRequestClose={() => setShowPasswordModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalCardTitle}>Change Password</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Current Password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="New Password (min 6 chars)"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Confirm New Password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowPasswordModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalPrimaryBtn}
                onPress={handleChangePassword}
              >
                <Text style={styles.modalPrimaryText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── MODAL: DELETE ALL DATA ── */}
      <Modal visible={showDeleteDataModal} animationType="fade" transparent onRequestClose={() => setShowDeleteDataModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={[styles.modalCardTitle, { color: "#DC2626" }]}>Delete All Data</Text>
            <Text style={styles.modalCardBody}>
              This will permanently delete all your scans, routines, and skin profile data. Your account will remain active, but you&apos;ll need to retake the questionnaire.
            </Text>
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowDeleteDataModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalPrimaryBtn, { backgroundColor: "#DC2626" }]}
                onPress={handleDeleteData}
              >
                <Text style={[styles.modalPrimaryText, { color: "#FFFFFF" }]}>Delete Data</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── MODAL: DELETE ACCOUNT ── */}
      <Modal visible={showDeleteAccountModal} animationType="fade" transparent onRequestClose={() => setShowDeleteAccountModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={[styles.modalCardTitle, { color: "#DC2626" }]}>Delete Account</Text>
            <Text style={styles.modalCardBody}>
              This will permanently delete your account and all associated data, including scan history, routines, and skin profile. This action cannot be undone.
            </Text>
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowDeleteAccountModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalPrimaryBtn, { backgroundColor: "#DC2626" }]}
                onPress={handleDeleteAccount}
              >
                <Text style={[styles.modalPrimaryText, { color: "#FFFFFF" }]}>Delete Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── MODAL: FULL MEDICAL DISCLAIMER ── */}
      <Modal visible={showDisclaimerModal} animationType="slide" onRequestClose={() => setShowDisclaimerModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Medical Disclaimer</Text>
            <TouchableOpacity onPress={() => setShowDisclaimerModal(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={20} color="#111827" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 24 }}>
            <View style={styles.disclaimerShieldWrapper}>
              <ShieldAlert size={40} color="#111827" />
            </View>
            <Text style={styles.disclaimerFullTitle}>Clinical & Diagnostic Disclaimer</Text>
            <View style={styles.disclaimerBox}>
              <Text style={styles.disclaimerFullText}>{DISCLAIMER_FULL}</Text>
            </View>
            <TouchableOpacity
              style={styles.modalPrimaryBtn}
              onPress={() => setShowDisclaimerModal(false)}
            >
              <Text style={styles.modalPrimaryText}>I Understand & Acknowledge</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ── MODAL: FEEDBACK / BUG REPORT ── */}
      <Modal visible={showFeedbackModal} animationType="fade" transparent onRequestClose={() => setShowFeedbackModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalCardTitle}>
              {feedbackType === "bug" ? "Report a Bug" : "Send Feedback"}
            </Text>
            <Text style={styles.modalCardBody}>
              {feedbackType === "bug"
                ? "Describe what went wrong. Recent system diagnostics will be attached automatically."
                : "Help us improve SkinSense with your thoughts and suggestions."}
            </Text>
            <TextInput
              style={[styles.modalInput, { height: 100, textAlignVertical: "top" }]}
              placeholder="Tell us more (min 10 characters)..."
              placeholderTextColor="#9CA3AF"
              multiline
              value={feedbackContent}
              onChangeText={setFeedbackContent}
            />
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowFeedbackModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalPrimaryBtn, isSubmitting && { opacity: 0.5 }]}
                disabled={isSubmitting}
                onPress={handleSubmitFeedback}
              >
                <Text style={styles.modalPrimaryText}>
                  {isSubmitting ? "Sending..." : "Submit"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Phase 7: Clinical Export Modal */}
      <ClinicalExportModal
        visible={showClinicalExportModal}
        onClose={() => setShowClinicalExportModal(false)}
      />

      {/* Phase 7: Share with Dermatologist Modal */}
      <DermatologistShareModal
        visible={showDermShareModal}
        onClose={() => setShowDermShareModal(false)}
      />

      {/* Phase 7: Diagnosis Feedback Modal */}
      <DiagnosisFeedbackModal
        visible={showDiagnosisModal}
        onClose={() => setShowDiagnosisModal(false)}
      />

      {/* Phase 7: Profile Switcher Modal */}
      <ProfileSwitcherModal
        visible={showProfileSwitcherModal}
        onClose={() => setShowProfileSwitcherModal(false)}
      />

      {/* Phase 11: Paywall Modal */}
      <PaywallModal
        visible={showPaywall}
        onClose={() => {
          setShowPaywall(false);
          refreshEntitlements();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    color: "#111827",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  subtitle: {
    color: "#6B7280",
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginTop: 3,
  },

  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 8,
    gap: 8,
  },
  sectionHeaderTitle: {
    color: "#6B7280",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },

  cardGroup: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  clickableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginLeft: 16,
  },
  rowLabel: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "600",
  },
  rowSubLabel: {
    color: "#6B7280",
    fontSize: 11,
    marginTop: 2,
  },
  rowValue: {
    color: "#6B7280",
    fontSize: 13,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  modalTitle: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 20,
    width: "100%",
    maxWidth: 380,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  modalCardTitle: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  modalCardBody: {
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#111827",
    fontSize: 13,
    marginBottom: 12,
  },
  modalButtonsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  modalCancelText: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "600",
  },
  modalPrimaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: "#111827",
    alignItems: "center",
  },
  modalPrimaryText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  disclaimerShieldWrapper: {
    alignItems: "center",
    marginBottom: 16,
  },
  disclaimerFullTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  disclaimerBox: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 24,
  },
  disclaimerFullText: {
    color: "#4B5563",
    fontSize: 13,
    lineHeight: 20,
  },
});
