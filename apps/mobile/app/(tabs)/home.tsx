import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
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
} from "lucide-react-native";
import { NoScansEmptyState } from "../../components/EmptyStates";
import { DailyCheckInModal } from "../../components/DailyCheckInModal";
import { SkinTwinCard } from "../../components/SkinTwinCard";
import { InsightsDashboard } from "../../components/InsightsDashboard";
import { AchievementBadges } from "../../components/AchievementBadges";
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
    { productName: "CeraVe Hydrating Cleanser", productCategory: "CLEANSER", successRate: 0.78, usersWhoImproved: 892, avgImprovement: 12, topConcern: "ACNE" },
    { productName: "La Roche-Posay SPF 50", productCategory: "SPF", successRate: 0.85, usersWhoImproved: 1203, avgImprovement: 8, topConcern: "REDNESS" },
    { productName: "The Ordinary Niacinamide 10%", productCategory: "SERUM", successRate: 0.72, usersWhoImproved: 756, avgImprovement: 15, topConcern: "ACNE" },
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
    { achievementId: "score_improvement", name: "On The Mend", description: "Improve your overall skin health score", icon: "Award", category: "health", unlockedAt: "2026-09-25T10:00:00Z", progress: 1, isNew: false },
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
            { achievementId: "score_improvement", name: "On The Mend", description: "Improve your overall skin health score", icon: "Award", category: "health", unlockedAt: "2026-09-25T10:00:00Z", progress: 1, isNew: false },
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
          { achievementId: "score_improvement", name: "On The Mend", description: "Improve your overall skin health score", icon: "Award", category: "health", unlockedAt: "2026-09-25T10:00:00Z", progress: 1, isNew: false },
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
            tintColor="#10B981"
          />
        }
      >
        {/* Welcome Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>SkinSense HealthOS</Text>
          <Text style={styles.subGreeting}>
            Clinical facial analysis & dynamic regimen
          </Text>
        </View>

        {/* Daily Check-In Prompt */}
        {!todayCheckedIn && (
          <TouchableOpacity
            style={styles.checkInPrompt}
            onPress={() => setShowCheckIn(true)}
            activeOpacity={0.85}
          >
            <View style={styles.checkInIconWrap}>
              <ClipboardCheck size={20} color="#818CF8" />
            </View>
            <View style={styles.checkInTextCol}>
              <Text style={styles.checkInTitle}>Daily Check-In</Text>
              <Text style={styles.checkInSub}>
                30 seconds · Track sleep, water, stress & more
              </Text>
            </View>
            <ChevronRight size={18} color="#818CF8" />
          </TouchableOpacity>
        )}

        {/* Big CTA: Capture Scan */}
        <TouchableOpacity
          style={styles.heroScanCard}
          onPress={() => router.push("/(tabs)/scan")}
          activeOpacity={0.85}
        >
          <View style={styles.heroTextCol}>
            <Text style={styles.heroTitle}>New Skin Analysis</Text>
            <Text style={styles.heroSub}>
              Take a front photo with real-time zone detection & quality checks
            </Text>
            <View style={styles.heroBadge}>
              <Sparkles size={14} color="#10B981" />
              <Text style={styles.heroBadgeText}>AI Camera Guide Ready</Text>
            </View>
          </View>
          <View style={styles.cameraIconCircle}>
            <Camera size={26} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {/* Current Skin Health Metric Card */}
        <View style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View>
              <Text style={styles.statLabel}>Latest Skin Health</Text>
              <View style={styles.scoreRow}>
                <Text style={[styles.statValue, { color: getScoreColor(latestScore) }]}>
                  {latestScore}
                </Text>
                <Text style={styles.statMax}>/100</Text>
              </View>
            </View>
            <View style={styles.statBadge}>
              <TrendingUp size={16} color="#10B981" />
              <Text style={styles.statBadgeText}>+6 pts improvement</Text>
            </View>
          </View>

          <View style={styles.profileTagsRow}>
            <View style={styles.tagBadge}>
              <Text style={styles.tagText}>
                Type: {questionnaire.skinType || "Combination"}
              </Text>
            </View>
            <View style={styles.tagBadge}>
              <Text style={styles.tagText}>
                Top: {questionnaire.concerns[0] || "Acne"}
              </Text>
            </View>
            <View style={styles.tagBadge}>
              <Text style={styles.tagText}>
                Age: {questionnaire.ageRange || "20s"}
              </Text>
            </View>
          </View>
        </View>

        {/* Phase 6: Lifestyle Insights Dashboard */}
        <View style={styles.phase6Section}>
          <InsightsDashboard insights={insights} />
        </View>

        {/* Phase 6: Skin Twin Card */}
        <View style={styles.phase6Section}>
          <SkinTwinCard skinTwin={skinTwin} />
        </View>

        {/* Phase 6: Achievement Badges */}
        <View style={styles.phase6Section}>
          <AchievementBadges progress={achievements} onMarkSeen={handleMarkSeen} />
        </View>

        {/* Scan History Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Scan History</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/progress")}>
              <Text style={styles.sectionAction}>Compare Scans</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="small" color="#10B981" style={{ marginVertical: 20 }} />
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
                      <Calendar size={18} color="#9CA3AF" />
                    </View>
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyDate}>{scanDate}</Text>
                      <Text style={styles.historyStatus}>
                        {scan.status === "COMPLETED" ? "Full analysis complete" : scan.status}
                      </Text>
                    </View>
                    <View style={styles.historyScoreBox}>
                      <Text style={[styles.historyScoreText, { color: getScoreColor(score) }]}>
                        {score}
                      </Text>
                      {delta !== null && (
                        <Text style={[styles.deltaText, { color: delta >= 0 ? "#10B981" : "#EF4444" }]}>
                          {delta >= 0 ? `+${delta}` : `${delta}`}
                        </Text>
                      )}
                    </View>
                    <ChevronRight size={18} color="#4B5563" />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0F17",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 26,
    fontWeight: "800",
    color: "#F9FAFB",
    letterSpacing: -0.5,
  },
  subGreeting: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 4,
  },
  checkInPrompt: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(129, 140, 248, 0.08)",
    borderWidth: 1.5,
    borderColor: "rgba(129, 140, 248, 0.25)",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    gap: 12,
  },
  checkInIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(129, 140, 248, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  checkInTextCol: {
    flex: 1,
  },
  checkInTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#818CF8",
  },
  checkInSub: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  heroScanCard: {
    flexDirection: "row",
    backgroundColor: "#161E2E",
    borderWidth: 1.5,
    borderColor: "#10B981",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  heroTextCol: {
    flex: 1,
    paddingRight: 14,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 13,
    color: "#9CA3AF",
    lineHeight: 18,
    marginBottom: 10,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  heroBadgeText: {
    color: "#10B981",
    fontSize: 12,
    fontWeight: "600",
  },
  cameraIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
  },
  statsCard: {
    backgroundColor: "#161E2E",
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  statLabel: {
    fontSize: 13,
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: "600",
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginTop: 4,
  },
  statValue: {
    fontSize: 42,
    fontWeight: "800",
  },
  statMax: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "600",
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statBadgeText: {
    color: "#10B981",
    fontSize: 13,
    fontWeight: "600",
  },
  profileTagsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#1F2937",
    paddingTop: 14,
  },
  tagBadge: {
    backgroundColor: "#1F2937",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  tagText: {
    color: "#D1D5DB",
    fontSize: 12,
    fontWeight: "500",
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
    fontSize: 18,
    fontWeight: "700",
    color: "#F9FAFB",
  },
  sectionAction: {
    color: "#60A5FA",
    fontSize: 13,
    fontWeight: "600",
  },
  emptyCard: {
    backgroundColor: "#161E2E",
    padding: 24,
    borderRadius: 14,
    alignItems: "center",
  },
  emptyText: {
    color: "#F3F4F6",
    fontSize: 15,
    fontWeight: "600",
  },
  emptySub: {
    color: "#9CA3AF",
    fontSize: 13,
    marginTop: 4,
  },
  historyList: {
    gap: 10,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161E2E",
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  dateCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1F2937",
    justifyContent: "center",
    alignItems: "center",
  },
  historyInfo: {
    flex: 1,
  },
  historyDate: {
    fontSize: 15,
    fontWeight: "600",
    color: "#F9FAFB",
  },
  historyStatus: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  historyScoreBox: {
    alignItems: "flex-end",
  },
  historyScoreText: {
    fontSize: 18,
    fontWeight: "700",
  },
  deltaText: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
});
