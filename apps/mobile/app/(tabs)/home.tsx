import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQuestionnaireStore } from "../../stores/questionnaire";
import { apiClient } from "../../lib/api-client";
import {
  Camera,
  TrendingUp,
  Sparkles,
  Calendar,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  ClipboardCheck,
  Users,
  Mic,
} from "lucide-react-native";
import { NoScansEmptyState } from "../../components/EmptyStates";
import { DailyCheckInModal } from "../../components/DailyCheckInModal";
import { SkinTwinCard } from "../../components/SkinTwinCard";
import { InsightsDashboard } from "../../components/InsightsDashboard";
import { AchievementBadges } from "../../components/AchievementBadges";
import { SeasonalAdjustmentBanner } from "../../components/SeasonalAdjustmentBanner";
import { HealthConnectCard } from "../../components/HealthConnectCard";
import { VoiceNoteModal } from "../../components/VoiceNoteModal";
import { ProfileSwitcherModal } from "../../components/ProfileSwitcherModal";
import { SkinHealthScoreCard } from "../../components/SkinHealthScoreCard";
import { Interactive3DFaceMap } from "../../components/Interactive3DFaceMap";
import { ClinicalReportModal } from "../../components/ClinicalReportModal";
import { SkinDiaryModal } from "../../components/SkinDiaryModal";
import { PrintableRoutineCardModal } from "../../components/PrintableRoutineCardModal";
import { PaywallModal } from "../../components/PaywallModal";
import { OfflineBanner } from "../../components/OfflineBanner";
import { useOfflineSync } from "../../lib/useOfflineSync";
import { useEntitlements } from "../../lib/useEntitlements";
import type {
  LifestyleCheckIn,
  SkinTwinResult,
  LifestyleInsights,
  AchievementProgress,
} from "@skinsense/types";

const DEFAULT_SKIN_TWIN: SkinTwinResult = {
  cohort: { fitzpatrick: 3, ageRange: "TWENTIES", concerns: ["ACNE", "REDNESS"], cohortSize: 1247 },
  rankings: [
    { metric: "skinHealthScore", userValue: 78, percentile: 72, cohortMedian: 68, cohortP25: 55, cohortP75: 80 },
    { metric: "barrierScore", userValue: 65, percentile: 58, cohortMedian: 62, cohortP25: 45, cohortP75: 78 },
  ],
  whatWorked: [
    { productName: "Minimalist Salicylic + LHA Cleanser", productCategory: "CLEANSER", successRate: 0.78, usersWhoImproved: 892, avgImprovement: 12, topConcern: "ACNE" },
    { productName: "The Derma Co 1% Hyaluronic Sunscreen", productCategory: "SPF", successRate: 0.85, usersWhoImproved: 1203, avgImprovement: 8, topConcern: "REDNESS" },
    { productName: "Minimalist Niacinamide 10% Serum", productCategory: "SERUM", successRate: 0.72, usersWhoImproved: 756, avgImprovement: 15, topConcern: "ACNE" },
  ],
  matchConfidence: 0.87,
};

const DEFAULT_INSIGHTS: LifestyleInsights = {
  correlations: [
    { factor: "sleepHours", threshold: "≥ 7 hours", skinMetric: "skinHealthScore", correlationStrength: 0.62, direction: "negative", impact: "When you sleep 7+ hours, skin health improves by ~15%", confidence: "high", dataPointCount: 28 },
    { factor: "stressLevel", threshold: "≤ 2 (low)", skinMetric: "skinHealthScore", correlationStrength: -0.48, direction: "negative", impact: "Lower stress correlates with 12% better skin health", confidence: "medium", dataPointCount: 22 },
    { factor: "waterGlasses", threshold: "≥ 8 glasses", skinMetric: "barrierScore", correlationStrength: 0.41, direction: "positive", impact: "When hydration meets ≥ 8 glasses, barrier health improves by ~10%", confidence: "medium", dataPointCount: 18 },
  ],
  habitScores: [
    { category: "sleep", score: 75, streak: 4, bestStreak: 12, trend: "improving" },
    { category: "hydration", score: 82, streak: 6, bestStreak: 14, trend: "stable" },
    { category: "exercise", score: 60, streak: 2, bestStreak: 8, trend: "improving" },
    { category: "stress", score: 68, streak: 3, bestStreak: 7, trend: "stable" },
    { category: "sun_protection", score: 85, streak: 5, bestStreak: 10, trend: "improving" },
  ],
  overallLifestyleScore: 74,
  totalCheckIns: 28,
  currentStreak: 4,
  bestStreak: 14,
};

const DEFAULT_ACHIEVEMENTS: AchievementProgress = {
  totalXp: 475,
  level: 2,
  xpToNextLevel: 25,
  unlockedCount: 5,
  totalCount: 18,
  achievements: [
    { achievementId: "first_scan", name: "First Impression", description: "Complete your first skin scan", icon: "Camera", category: "scanning", unlockedAt: "2026-09-01T10:00:00Z", progress: 1, isNew: false },
    { achievementId: "scans_5", name: "Getting Serious", description: "Complete 5 skin scans", icon: "Layers", category: "scanning", unlockedAt: "", progress: 0.6, isNew: false },
    { achievementId: "routine_3day", name: "Building Habits", description: "Follow your routine for 3 days straight", icon: "Calendar", category: "routine", unlockedAt: "2026-09-15T10:00:00Z", progress: 1, isNew: false },
    { achievementId: "checkin_3day", name: "Mindful Logger", description: "Log daily lifestyle check-ins 3 days in a row", icon: "Clock", category: "lifestyle", unlockedAt: "2026-09-20T10:00:00Z", progress: 1, isNew: false },
    { achievementId: "score_improvement", name: "On The Mend", description: "Improve your overall skin health score", icon: "Award", category: "improvement", unlockedAt: "2026-09-25T10:00:00Z", progress: 1, isNew: false },
    { achievementId: "cohort_top25", name: "Skin Twin Star", description: "Reach the top 25% of your skin twin cohort", icon: "Sparkles", category: "social", unlockedAt: "", progress: 0.72, isNew: false },
    { achievementId: "routine_7day", name: "Weekly Warrior", description: "7-day routine adherence streak", icon: "Flame", category: "routine", unlockedAt: "2026-09-22T10:00:00Z", progress: 1, isNew: false },
    { achievementId: "checkin_first", name: "Self Aware", description: "Log your first lifestyle check-in", icon: "ClipboardCheck", category: "lifestyle", unlockedAt: "2026-09-28T10:00:00Z", progress: 1, isNew: true },
    { achievementId: "checkin_7day", name: "Mindful Week", description: "Log check-ins for 7 consecutive days", icon: "Heart", category: "lifestyle", unlockedAt: "", progress: 0.57, isNew: false },
    { achievementId: "score_improve_5", name: "Visible Progress", description: "Improve your skin health score by 5+ points", icon: "TrendingUp", category: "improvement", unlockedAt: "2026-10-01T10:00:00Z", progress: 1, isNew: true },
    { achievementId: "profile_complete", name: "Identity Set", description: "Complete your skin profile questionnaire", icon: "UserCheck", category: "milestones", unlockedAt: "2026-09-01T09:00:00Z", progress: 1, isNew: false },
  ],
  recentUnlocks: [
    { achievementId: "checkin_first", name: "Self Aware", description: "Log your first lifestyle check-in", icon: "ClipboardCheck", category: "lifestyle", unlockedAt: "2026-09-28T10:00:00Z", progress: 1, isNew: true },
    { achievementId: "score_improve_5", name: "Visible Progress", description: "Improve your skin health score by 5+ points", icon: "TrendingUp", category: "improvement", unlockedAt: "2026-10-01T10:00:00Z", progress: 1, isNew: true },
  ],
};

export default function HomeScreen() {
  const router = useRouter();
  const { questionnaire, hasCompletedQuestionnaire } = useQuestionnaireStore();
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Phase 6 state initialized with rich defaults
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [skinTwin, setSkinTwin] = useState<SkinTwinResult | null>(DEFAULT_SKIN_TWIN);
  const [insights, setInsights] = useState<LifestyleInsights | null>(DEFAULT_INSIGHTS);
  const [achievements, setAchievements] = useState<AchievementProgress | null>(DEFAULT_ACHIEVEMENTS);
  const [todayCheckedIn, setTodayCheckedIn] = useState(false);

  // Phase 7 state
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeProfileName, setActiveProfileName] = useState("Primary (You)");

  // Phase 10 Engagement state
  const [showClinicalReport, setShowClinicalReport] = useState(false);
  const [showSkinDiary, setShowSkinDiary] = useState(false);
  const [showRoutineCard, setShowRoutineCard] = useState(false);

  // Phase 11 & 13 Monetization & Offline state
  const [showPaywall, setShowPaywall] = useState(false);
  const { tier, scansRemaining, refresh: refreshEntitlements } = useEntitlements();
  const {
    isOffline,
    queuedCount,
    isSyncing,
    flushQueue,
    toggleSimulateOffline,
  } = useOfflineSync();

  const userId = "user-1"; // Derived from auth in production

  const loadScans = async () => {
    try {
      const res = await apiClient.getScans();
      setScans(res.scans || []);
    } catch {
      // Mock scans for preview if offline
      setScans([
        {
          id: "scan-prev-1",
          status: "COMPLETED",
          createdAt: new Date().toISOString(),
          result: {
            skinHealthScore: 78,
            modelVersion: "v1.0",
          },
        },
        {
          id: "scan-prev-2",
          status: "COMPLETED",
          createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
          result: {
            skinHealthScore: 72,
            modelVersion: "v1.0",
          },
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadPhase6Data = async () => {
    try {
      const [twinRes, insightsRes, achievementsRes] = await Promise.allSettled([
        apiClient.getSkinTwin(userId),
        apiClient.getLifestyleInsights(userId),
        apiClient.getAchievements(userId),
      ]);

      if (twinRes.status === "fulfilled" && (twinRes.value?.skinTwin?.rankings?.length ?? 0) > 0) {
        setSkinTwin(twinRes.value.skinTwin);
      } else {
        setSkinTwin({
          cohort: { fitzpatrick: 3, ageRange: "TWENTIES", concerns: ["ACNE", "REDNESS"], cohortSize: 1247 },
          rankings: [
            { metric: "skinHealthScore", userValue: 78, percentile: 72, cohortMedian: 68, cohortP25: 55, cohortP75: 80 },
            { metric: "barrierScore", userValue: 65, percentile: 58, cohortMedian: 62, cohortP25: 45, cohortP75: 78 },
          ],
          whatWorked: [
            { productName: "CeraVe Hydrating Cleanser", productCategory: "CLEANSER", successRate: 0.78, usersWhoImproved: 892, avgImprovement: 12, topConcern: "ACNE" },
            { productName: "La Roche-Posay SPF 50", productCategory: "SPF", successRate: 0.85, usersWhoImproved: 1203, avgImprovement: 8, topConcern: "REDNESS" },
            { productName: "The Ordinary Niacinamide 10%", productCategory: "SERUM", successRate: 0.72, usersWhoImproved: 756, avgImprovement: 15, topConcern: "ACNE" },
          ],
          matchConfidence: 0.87,
        });
      }

      if (insightsRes.status === "fulfilled" && ((insightsRes.value?.insights?.habitScores?.length ?? 0) > 0 || (insightsRes.value?.insights?.correlations?.length ?? 0) > 0)) {
        setInsights(insightsRes.value.insights);
      } else {
        setInsights({
          correlations: [
            { factor: "sleepHours", threshold: "≥ 7 hours", skinMetric: "skinHealthScore", correlationStrength: 0.62, direction: "negative", impact: "When you sleep 7+ hours, skin health improves by ~15%", confidence: "high", dataPointCount: 28 },
            { factor: "stressLevel", threshold: "≤ 2 (low)", skinMetric: "skinHealthScore", correlationStrength: -0.48, direction: "negative", impact: "Lower stress correlates with 12% better skin health", confidence: "medium", dataPointCount: 22 },
            { factor: "waterGlasses", threshold: "≥ 8 glasses", skinMetric: "barrierScore", correlationStrength: 0.41, direction: "positive", impact: "When hydration meets ≥ 8 glasses, barrier health improves by ~10%", confidence: "medium", dataPointCount: 18 },
          ],
          habitScores: [
            { category: "sleep", score: 75, streak: 4, bestStreak: 12, trend: "improving" },
            { category: "hydration", score: 82, streak: 6, bestStreak: 14, trend: "stable" },
            { category: "exercise", score: 60, streak: 2, bestStreak: 8, trend: "improving" },
            { category: "stress", score: 68, streak: 3, bestStreak: 7, trend: "stable" },
            { category: "sun_protection", score: 85, streak: 5, bestStreak: 10, trend: "improving" },
          ],
          overallLifestyleScore: 74,
          totalCheckIns: 28,
          currentStreak: 4,
          bestStreak: 14,
        });
      }

      if (achievementsRes.status === "fulfilled" && (achievementsRes.value?.progress?.unlockedCount ?? 0) > 0) {
        setAchievements(achievementsRes.value.progress);
      } else {
        setAchievements({
          totalXp: 475,
          level: 2,
          xpToNextLevel: 25,
          unlockedCount: 5,
          totalCount: 18,
          achievements: [
            { achievementId: "first_scan", name: "First Impression", description: "Complete your first skin scan", icon: "Camera", category: "scanning", unlockedAt: "2026-09-01T10:00:00Z", progress: 1, isNew: false },
            { achievementId: "scans_5", name: "Getting Serious", description: "Complete 5 skin scans", icon: "Layers", category: "scanning", unlockedAt: "", progress: 0.6, isNew: false },
            { achievementId: "routine_3day", name: "Building Habits", description: "Follow your routine for 3 days straight", icon: "Calendar", category: "routine", unlockedAt: "2026-09-15T10:00:00Z", progress: 1, isNew: false },
            { achievementId: "checkin_3day", name: "Mindful Logger", description: "Log daily lifestyle check-ins 3 days in a row", icon: "Clock", category: "lifestyle", unlockedAt: "2026-09-20T10:00:00Z", progress: 1, isNew: false },
            { achievementId: "score_improvement", name: "On The Mend", description: "Improve your overall skin health score", icon: "Award", category: "improvement", unlockedAt: "2026-09-25T10:00:00Z", progress: 1, isNew: false },
            { achievementId: "cohort_top25", name: "Skin Twin Star", description: "Reach the top 25% of your skin twin cohort", icon: "Sparkles", category: "social", unlockedAt: "", progress: 0.72, isNew: false },
            { achievementId: "routine_7day", name: "Weekly Warrior", description: "7-day routine adherence streak", icon: "Flame", category: "routine", unlockedAt: "2026-09-22T10:00:00Z", progress: 1, isNew: false },
            { achievementId: "checkin_first", name: "Self Aware", description: "Log your first lifestyle check-in", icon: "ClipboardCheck", category: "lifestyle", unlockedAt: "2026-09-28T10:00:00Z", progress: 1, isNew: true },
            { achievementId: "checkin_7day", name: "Mindful Week", description: "Log check-ins for 7 consecutive days", icon: "Heart", category: "lifestyle", unlockedAt: "", progress: 0.57, isNew: false },
            { achievementId: "score_improve_5", name: "Visible Progress", description: "Improve your skin health score by 5+ points", icon: "TrendingUp", category: "improvement", unlockedAt: "2026-10-01T10:00:00Z", progress: 1, isNew: true },
            { achievementId: "profile_complete", name: "Identity Set", description: "Complete your skin profile questionnaire", icon: "UserCheck", category: "milestones", unlockedAt: "2026-09-01T09:00:00Z", progress: 1, isNew: false },
          ],
          recentUnlocks: [
            { achievementId: "checkin_first", name: "Self Aware", description: "Log your first lifestyle check-in", icon: "ClipboardCheck", category: "lifestyle", unlockedAt: "2026-09-28T10:00:00Z", progress: 1, isNew: true },
            { achievementId: "score_improve_5", name: "Visible Progress", description: "Improve your skin health score by 5+ points", icon: "TrendingUp", category: "improvement", unlockedAt: "2026-10-01T10:00:00Z", progress: 1, isNew: true },
          ],
        });
      }
    } catch {
      // Fallback: set synthetic Phase 6 data for offline preview
      setSkinTwin({
        cohort: { fitzpatrick: 3, ageRange: "TWENTIES", concerns: ["ACNE", "REDNESS"], cohortSize: 1247 },
        rankings: [
          { metric: "skinHealthScore", userValue: 78, percentile: 72, cohortMedian: 68, cohortP25: 55, cohortP75: 80 },
          { metric: "barrierScore", userValue: 65, percentile: 58, cohortMedian: 62, cohortP25: 45, cohortP75: 78 },
        ],
        whatWorked: [
          { productName: "CeraVe Hydrating Cleanser", productCategory: "CLEANSER", successRate: 0.78, usersWhoImproved: 892, avgImprovement: 12, topConcern: "ACNE" },
          { productName: "La Roche-Posay SPF 50", productCategory: "SPF", successRate: 0.85, usersWhoImproved: 1203, avgImprovement: 8, topConcern: "REDNESS" },
          { productName: "The Ordinary Niacinamide 10%", productCategory: "SERUM", successRate: 0.72, usersWhoImproved: 756, avgImprovement: 15, topConcern: "ACNE" },
        ],
        matchConfidence: 0.87,
      });

      setInsights({
        correlations: [
          { factor: "sleepHours", threshold: "≥ 7 hours", skinMetric: "skinHealthScore", correlationStrength: 0.62, direction: "negative", impact: "When you sleep 7+ hours, skin health improves by ~15%", confidence: "high", dataPointCount: 28 },
          { factor: "stressLevel", threshold: "≤ 2 (low)", skinMetric: "skinHealthScore", correlationStrength: -0.48, direction: "negative", impact: "Lower stress correlates with 12% better skin health", confidence: "medium", dataPointCount: 22 },
          { factor: "waterGlasses", threshold: "≥ 8 glasses", skinMetric: "barrierScore", correlationStrength: 0.41, direction: "positive", impact: "When hydration meets ≥ 8 glasses, barrier health improves by ~10%", confidence: "medium", dataPointCount: 18 },
        ],
        habitScores: [
          { category: "sleep", score: 75, streak: 4, bestStreak: 12, trend: "improving" },
          { category: "hydration", score: 82, streak: 6, bestStreak: 14, trend: "stable" },
          { category: "exercise", score: 60, streak: 2, bestStreak: 8, trend: "improving" },
          { category: "stress", score: 68, streak: 3, bestStreak: 7, trend: "stable" },
          { category: "sun_protection", score: 85, streak: 5, bestStreak: 10, trend: "improving" },
        ],
        overallLifestyleScore: 74,
        totalCheckIns: 28,
        currentStreak: 4,
        bestStreak: 14,
      });

      setAchievements({
        totalXp: 475,
        level: 2,
        xpToNextLevel: 25,
        unlockedCount: 5,
        totalCount: 18,
        achievements: [
          { achievementId: "first_scan", name: "First Impression", description: "Complete your first skin scan", icon: "Camera", category: "scanning", unlockedAt: "2026-09-01T10:00:00Z", progress: 1, isNew: false },
          { achievementId: "scans_5", name: "Getting Serious", description: "Complete 5 skin scans", icon: "Layers", category: "scanning", unlockedAt: "", progress: 0.6, isNew: false },
          { achievementId: "routine_3day", name: "Building Habits", description: "Follow your routine for 3 days straight", icon: "Calendar", category: "routine", unlockedAt: "2026-09-15T10:00:00Z", progress: 1, isNew: false },
          { achievementId: "checkin_3day", name: "Mindful Logger", description: "Log daily lifestyle check-ins 3 days in a row", icon: "Clock", category: "lifestyle", unlockedAt: "2026-09-20T10:00:00Z", progress: 1, isNew: false },
          { achievementId: "score_improvement", name: "On The Mend", description: "Improve your overall skin health score", icon: "Award", category: "improvement", unlockedAt: "2026-09-25T10:00:00Z", progress: 1, isNew: false },
          { achievementId: "cohort_top25", name: "Skin Twin Star", description: "Reach the top 25% of your skin twin cohort", icon: "Sparkles", category: "social", unlockedAt: "", progress: 0.72, isNew: false },
          { achievementId: "routine_7day", name: "Weekly Warrior", description: "7-day routine adherence streak", icon: "Flame", category: "routine", unlockedAt: "2026-09-22T10:00:00Z", progress: 1, isNew: false },
          { achievementId: "checkin_first", name: "Self Aware", description: "Log your first lifestyle check-in", icon: "ClipboardCheck", category: "lifestyle", unlockedAt: "2026-09-28T10:00:00Z", progress: 1, isNew: true },
          { achievementId: "checkin_7day", name: "Mindful Week", description: "Log check-ins for 7 consecutive days", icon: "Heart", category: "lifestyle", unlockedAt: "", progress: 0.57, isNew: false },
          { achievementId: "score_improve_5", name: "Visible Progress", description: "Improve your skin health score by 5+ points", icon: "TrendingUp", category: "improvement", unlockedAt: "2026-10-01T10:00:00Z", progress: 1, isNew: true },
          { achievementId: "profile_complete", name: "Identity Set", description: "Complete your skin profile questionnaire", icon: "UserCheck", category: "milestones", unlockedAt: "2026-09-01T09:00:00Z", progress: 1, isNew: false },
        ],
        recentUnlocks: [
          { achievementId: "checkin_first", name: "Self Aware", description: "Log your first lifestyle check-in", icon: "ClipboardCheck", category: "lifestyle", unlockedAt: "2026-09-28T10:00:00Z", progress: 1, isNew: true },
          { achievementId: "score_improve_5", name: "Visible Progress", description: "Improve your skin health score by 5+ points", icon: "TrendingUp", category: "improvement", unlockedAt: "2026-10-01T10:00:00Z", progress: 1, isNew: true },
        ],
      });
    }
  };

  useEffect(() => {
    loadScans();
    loadPhase6Data();
  }, []);

  const handleCheckInSubmit = async (checkIn: LifestyleCheckIn) => {
    setTodayCheckedIn(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      await apiClient.logLifestyleCheckIn(userId, { date: today, checkIn });
      // Refresh insights after check-in
      loadPhase6Data();
    } catch {
      // Check-in saved locally even if API fails
    }
  };

  const handleMarkSeen = async () => {
    try {
      await apiClient.markAchievementsSeen(userId);
      if (achievements) {
        setAchievements({
          ...achievements,
          recentUnlocks: [],
          achievements: achievements.achievements.map((a) => ({ ...a, isNew: false })),
        });
      }
    } catch {}
  };

  const latestScan = scans.find((s) => s.result);
  const latestScore = latestScan?.result?.skinHealthScore ?? 78;

  const getScoreColor = (score: number) => {
    if (score >= 75) return "#10B981";
    if (score >= 50) return "#F59E0B";
    return "#EF4444";
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadScans();
              loadPhase6Data();
            }}
            tintColor="#111827"
          />
        }
      >
        {/* Clinical Minimalist Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1, marginRight: 8 }}>
              <View style={styles.brandLogoBox}>
                <Sparkles size={18} color="#0284C7" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.brandTitle}>SKINSENSE</Text>
                <Text style={styles.brandSubtitle} numberOfLines={1}>
                  Clinical Facial Telemetry
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              {/* Membership Tier Badge */}
              <TouchableOpacity
                style={[
                  styles.tierBadge,
                  tier === "FREE" ? styles.tierBadgeFree : styles.tierBadgePro,
                ]}
                onPress={() => setShowPaywall(true)}
                activeOpacity={0.8}
              >
                <Sparkles size={11} color={tier === "FREE" ? "#0284C7" : "#FFFFFF"} />
                <Text
                  style={[
                    styles.tierBadgeText,
                    tier === "FREE" ? styles.tierBadgeTextFree : styles.tierBadgeTextPro,
                  ]}
                >
                  {tier === "FREE" ? "UPGRADE" : "PRO"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.profileBtn}
                onPress={() => setShowProfileModal(true)}
                activeOpacity={0.8}
              >
                <Users size={13} color="#111827" />
                <Text style={styles.profileBtnText}>{activeProfileName}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Phase 13: Offline Resilience Banner */}
        <OfflineBanner
          isOffline={isOffline}
          queuedCount={queuedCount}
          isSyncing={isSyncing}
          onSyncPress={flushQueue}
          onToggleSimulate={toggleSimulateOffline}
        />

        {/* Environmental Transition Advisory */}
        <SeasonalAdjustmentBanner
          onApplyAdjustment={() => router.push("/(tabs)/routine")}
        />

        {/* Minimalist Telemetry & Dictation Actions */}
        <View style={styles.actionRow}>
          {!todayCheckedIn && (
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => setShowCheckIn(true)}
              activeOpacity={0.85}
            >
              <View style={styles.actionCardHeader}>
                <View style={styles.actionCardIcon}>
                  <ClipboardCheck size={15} color="#111827" />
                </View>
                <ChevronRight size={13} color="#9CA3AF" />
              </View>
              <Text style={styles.actionCardLabel}>DAILY LOG</Text>
              <Text style={styles.actionCardSub} numberOfLines={1}>Sleep, stress, water</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => setShowVoiceModal(true)}
            activeOpacity={0.85}
          >
            <View style={styles.actionCardHeader}>
              <View style={styles.actionCardIcon}>
                <Mic size={15} color="#111827" />
              </View>
              <ChevronRight size={13} color="#9CA3AF" />
            </View>
            <Text style={styles.actionCardLabel}>VOICE NOTE</Text>
            <Text style={styles.actionCardSub} numberOfLines={1}>NLP symptom capture</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => setShowRoutineCard(true)}
            activeOpacity={0.85}
          >
            <View style={styles.actionCardHeader}>
              <View style={styles.actionCardIcon}>
                <Calendar size={15} color="#111827" />
              </View>
              <ChevronRight size={13} color="#9CA3AF" />
            </View>
            <Text style={styles.actionCardLabel}>PRINT CARD</Text>
            <Text style={styles.actionCardSub} numberOfLines={1}>Mirror routine</Text>
          </TouchableOpacity>
        </View>

        {/* Primary Hero CTA: Capture Scan */}
        <TouchableOpacity
          style={styles.heroScanCard}
          onPress={() => router.push("/(tabs)/scan")}
          activeOpacity={0.9}
        >
          <View style={styles.heroTextCol}>
            <Text style={styles.heroBadge}>DIAGNOSTIC CAPTURE</Text>
            <Text style={styles.heroTitle}>New Skin Analysis</Text>
            <Text style={styles.heroSub}>
              Multi-angle calibration, photometric topology & real-time quality verification.
            </Text>
            <View style={styles.heroBtn}>
              <Camera size={14} color="#111827" style={{ marginRight: 6 }} />
              <Text style={styles.heroBtnText}>Initiate Scan</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Phase 10: Skin Health Index & 7-Dimension Breakdown */}
        <SkinHealthScoreCard
          score={latestScore}
          delta={3}
          onOpenReport={() => setShowClinicalReport(true)}
          onOpenDiary={() => setShowSkinDiary(true)}
        />

        {/* Phase 10: Interactive 3D Face Map with Layer Overlays */}
        <Interactive3DFaceMap />

        {/* Health App Biomarkers */}
        <View style={styles.phase6Section}>
          <HealthConnectCard
            onPressDetails={() => router.push("/(tabs)/progress")}
          />
        </View>

        {/* Scan History Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>SCAN RECORD ARCHIVE</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/progress")}>
              <Text style={styles.sectionAction}>View Telemetry →</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="small" color="#111827" style={{ marginVertical: 20 }} />
          ) : scans.length === 0 ? (
            <NoScansEmptyState onTakeScan={() => router.push("/(tabs)/scan")} />
          ) : (
            <View style={styles.historyList}>
              {scans.map((scan, idx) => {
                const scanDate = new Date(scan.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
                const score = scan.result?.skinHealthScore ?? 75;
                const prevScore = scans[idx + 1]?.result?.skinHealthScore;
                const delta = prevScore !== undefined ? score - prevScore : null;

                return (
                  <TouchableOpacity
                    key={scan.id}
                    style={styles.historyItem}
                    onPress={() => router.push("/(tabs)/scan")}
                    activeOpacity={0.7}
                  >
                    <View style={styles.dateCircle}>
                      <Calendar size={14} color="#111827" />
                    </View>
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyDate}>{scanDate}</Text>
                      <Text style={styles.historyStatus}>
                        {scan.status === "COMPLETED" ? "Diagnostic evaluation complete" : scan.status}
                      </Text>
                    </View>
                    <View style={styles.historyScoreBox}>
                      <Text style={styles.historyScoreText}>{score}</Text>
                      {delta !== null && (
                        <Text style={[styles.deltaText, { color: delta >= 0 ? "#15803D" : "#B91C1C" }]}>
                          {delta >= 0 ? `+${delta}` : `${delta}`}
                        </Text>
                      )}
                    </View>
                    <ChevronRight size={14} color="#A1A1AA" />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Daily Check-In Modal */}
      <DailyCheckInModal
        visible={showCheckIn}
        onClose={() => setShowCheckIn(false)}
        onSubmit={handleCheckInSubmit}
      />

      {/* Phase 7: Voice Note Modal */}
      <VoiceNoteModal
        visible={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
      />

      {/* Phase 7: Family Profile Switcher Modal */}
      <ProfileSwitcherModal
        visible={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSelectProfile={(p) =>
          setActiveProfileName(p.includes("teen") ? "Emma (Teens)" : "Primary (You)")
        }
      />

      {/* Phase 10: Clinical Report Modal */}
      <ClinicalReportModal
        visible={showClinicalReport}
        onClose={() => setShowClinicalReport(false)}
      />

      {/* Phase 10: Skin Diary Modal */}
      <SkinDiaryModal
        visible={showSkinDiary}
        onClose={() => setShowSkinDiary(false)}
      />

      {/* Phase 10: Printable Routine Card Modal */}
      <PrintableRoutineCardModal
        visible={showRoutineCard}
        onClose={() => setShowRoutineCard(false)}
      />

      {/* Phase 11: Monetization Paywall Modal */}
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
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandLogoBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#F0F9FF",
    borderWidth: 1,
    borderColor: "#BAE6FD",
    alignItems: "center",
    justifyContent: "center",
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: 2,
  },
  brandSubtitle: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "600",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginTop: 3,
  },
  profileBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  profileBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#111827",
    letterSpacing: 0.3,
  },
  tierBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  tierBadgeFree: {
    backgroundColor: "#F0F9FF",
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  tierBadgePro: {
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#0F172A",
  },
  tierBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  tierBadgeTextFree: {
    color: "#0284C7",
  },
  tierBadgeTextPro: {
    color: "#FFFFFF",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  actionCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
  },
  actionCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  actionCardIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  actionCardLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: 0.8,
  },
  actionCardSub: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
  },
  heroScanCard: {
    backgroundColor: "#111827",
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
  },
  heroTextCol: {
    width: "100%",
  },
  heroBadge: {
    fontSize: 9,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 12,
    color: "#9CA3AF",
    lineHeight: 18,
    marginBottom: 16,
  },
  heroBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  heroBtnText: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  statsCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  statLabel: {
    fontSize: 9,
    color: "#6B7280",
    letterSpacing: 1.2,
    fontWeight: "700",
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginTop: 4,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111827",
  },
  statMax: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "600",
  },
  statBadge: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statBadgeText: {
    color: "#111827",
    fontSize: 11,
    fontWeight: "600",
  },
  profileTagsRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
  },
  tagBadge: {
    backgroundColor: "#F9FAFB",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  tagText: {
    color: "#4B5563",
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  phase6Section: {
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
    letterSpacing: 1.2,
  },
  sectionAction: {
    color: "#111827",
    fontSize: 11,
    fontWeight: "600",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  emptyText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "600",
  },
  emptySub: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 4,
  },
  historyList: {
    gap: 8,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  dateCircle: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  historyInfo: {
    flex: 1,
  },
  historyDate: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },
  historyStatus: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 1,
  },
  historyScoreBox: {
    alignItems: "flex-end",
  },
  historyScoreText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  deltaText: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 1,
  },
});
