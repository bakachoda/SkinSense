import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import {
  Lightbulb,
  Flame,
  Activity,
  Droplets,
  Moon,
  Dumbbell,
  Sun,
  Brain,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react-native";
import type { LifestyleInsights, LifestyleCorrelation, HabitScore, TrendDirection } from "@skinsense/types";

interface InsightsDashboardProps {
  insights: LifestyleInsights | null;
}

const HABIT_ICONS: Record<string, any> = {
  sleep: Moon,
  hydration: Droplets,
  exercise: Dumbbell,
  stress: Brain,
  sun_protection: Sun,
};

const HABIT_COLORS: Record<string, string> = {
  sleep: "#818CF8",
  hydration: "#60A5FA",
  exercise: "#34D399",
  stress: "#F472B6",
  sun_protection: "#FBBF24",
};

const CONFIDENCE_COLORS: Record<string, string> = {
  high: "#10B981",
  medium: "#F59E0B",
  low: "#6B7280",
};

function HabitScoreRing({ habit }: { habit: HabitScore }) {
  const Icon = HABIT_ICONS[habit.category] || Activity;
  const color = HABIT_COLORS[habit.category] || "#9CA3AF";
  const label = habit.category.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());

  const TrendIcon = habit.trend === "improving" ? ArrowUpRight : habit.trend === "declining" ? ArrowDownRight : Minus;
  const trendColor = habit.trend === "improving" ? "#10B981" : habit.trend === "declining" ? "#EF4444" : "#6B7280";

  return (
    <View style={styles.habitCard}>
      <View style={styles.habitIconWrap}>
        <Icon size={18} color={color} />
      </View>

      <View style={styles.habitScoreWrap}>
        <Text style={[styles.habitScore, { color }]}>{habit.score}</Text>
        <TrendIcon size={10} color={trendColor} />
      </View>

      <Text style={styles.habitLabel}>{label}</Text>

      {habit.streak > 0 && (
        <View style={styles.streakBadge}>
          <Flame size={10} color="#F97316" />
          <Text style={styles.streakText}>{habit.streak}d</Text>
        </View>
      )}
    </View>
  );
}

function CorrelationCard({ correlation }: { correlation: LifestyleCorrelation }) {
  const confColor = CONFIDENCE_COLORS[correlation.confidence] || "#6B7280";
  const isPositive = correlation.direction === "positive";

  return (
    <View style={styles.correlationCard}>
      <View style={styles.correlationHeader}>
        <View style={[styles.correlationDot, { backgroundColor: confColor }]} />
        <Text style={styles.correlationFactor}>
          {correlation.factor.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
        </Text>
        <View style={[styles.confBadge, { backgroundColor: `${confColor}20` }]}>
          <Text style={[styles.confText, { color: confColor }]}>
            {correlation.confidence}
          </Text>
        </View>
      </View>
      <Text style={styles.correlationImpact}>{correlation.impact}</Text>
      <View style={styles.correlationMeta}>
        <Text style={styles.correlationStrength}>
          r = {correlation.correlationStrength.toFixed(2)}
        </Text>
        <Text style={styles.correlationDatapoints}>
          {correlation.dataPointCount} data points
        </Text>
      </View>
    </View>
  );
}

export function InsightsDashboard({ insights }: InsightsDashboardProps) {
  if (!insights) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <Lightbulb size={20} color="#FBBF24" />
          <Text style={styles.title}>Lifestyle Insights</Text>
        </View>
        <Text style={styles.emptyText}>
          Log daily check-ins to unlock lifestyle correlations with your skin health
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconWrap, { backgroundColor: "rgba(251, 191, 36, 0.15)" }]}>
            <Lightbulb size={18} color="#FBBF24" />
          </View>
          <View>
            <Text style={styles.title}>Lifestyle Insights</Text>
            <Text style={styles.subtitle}>
              {insights.totalCheckIns} check-ins logged
            </Text>
          </View>
        </View>

        {/* Overall Score */}
        <View style={styles.overallWrap}>
          <Text style={styles.overallScore}>{insights.overallLifestyleScore}</Text>
          <Text style={styles.overallLabel}>Lifestyle</Text>
        </View>
      </View>

      {/* Streak */}
      {insights.currentStreak > 0 && (
        <View style={styles.streakBar}>
          <Flame size={16} color="#F97316" />
          <Text style={styles.streakBarText}>
            {insights.currentStreak}-day streak
          </Text>
          <Text style={styles.bestStreakText}>
            Best: {insights.bestStreak}d
          </Text>
        </View>
      )}

      {/* Habit Scores */}
      {insights.habitScores.length > 0 && (
        <View style={styles.habitsRow}>
          {insights.habitScores.map((habit) => (
            <HabitScoreRing key={habit.category} habit={habit} />
          ))}
        </View>
      )}

      {/* Correlations */}
      {insights.correlations.length > 0 && (
        <View style={styles.correlationsSection}>
          <View style={styles.correlationsHeader}>
            <Activity size={14} color="#9CA3AF" />
            <Text style={styles.correlationsTitle}>Your Skin Responds To</Text>
          </View>
          {insights.correlations.slice(0, 4).map((corr, i) => (
            <CorrelationCard key={i} correlation={corr} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1F2937",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#374151",
    gap: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F9FAFB",
  },
  subtitle: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
  },
  overallWrap: {
    alignItems: "center",
    backgroundColor: "rgba(129, 140, 248, 0.1)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  overallScore: {
    fontSize: 22,
    fontWeight: "800",
    color: "#818CF8",
  },
  overallLabel: {
    fontSize: 9,
    color: "#6B7280",
    fontWeight: "500",
  },
  emptyText: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    paddingVertical: 12,
  },
  streakBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(249, 115, 22, 0.08)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(249, 115, 22, 0.15)",
  },
  streakBarText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F97316",
    flex: 1,
  },
  bestStreakText: {
    fontSize: 11,
    color: "#6B7280",
  },
  habitsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  habitCard: {
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  habitIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#374151",
  },
  habitScoreWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  habitScore: {
    fontSize: 16,
    fontWeight: "800",
  },
  habitLabel: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "500",
    textAlign: "center",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "rgba(249, 115, 22, 0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  streakText: {
    fontSize: 9,
    fontWeight: "600",
    color: "#F97316",
  },
  correlationsSection: {
    gap: 8,
  },
  correlationsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  correlationsTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  correlationCard: {
    backgroundColor: "#111827",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#374151",
    gap: 6,
  },
  correlationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  correlationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  correlationFactor: {
    fontSize: 13,
    fontWeight: "600",
    color: "#D1D5DB",
    flex: 1,
  },
  confBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  confText: {
    fontSize: 9,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  correlationImpact: {
    fontSize: 12,
    color: "#9CA3AF",
    lineHeight: 17,
  },
  correlationMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  correlationStrength: {
    fontSize: 10,
    color: "#4B5563",
    fontFamily: "monospace",
  },
  correlationDatapoints: {
    fontSize: 10,
    color: "#4B5563",
  },
});
