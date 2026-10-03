import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Activity, Moon, Heart, Calendar, ShieldCheck, ChevronRight } from "lucide-react-native";

interface HealthConnectCardProps {
  sleepHours?: number;
  sleepQuality?: "poor" | "fair" | "good";
  hrvTrend?: "decreasing" | "stable" | "increasing";
  cyclePhase?: "follicular" | "ovulatory" | "luteal" | "menstrual";
  onPressDetails?: () => void;
}

export function HealthConnectCard({
  sleepHours = 7.2,
  sleepQuality = "good",
  hrvTrend = "stable",
  cyclePhase = "luteal",
  onPressDetails,
}: HealthConnectCardProps) {
  const getQualityColor = () => {
    switch (sleepQuality) {
      case "good":
        return "#10B981";
      case "fair":
        return "#F59E0B";
      case "poor":
      default:
        return "#EF4444";
    }
  };

  const isLutealHormonalRisk = cyclePhase === "luteal";

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={onPressDetails}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <Activity size={18} color="#EC4899" />
          </View>
          <View>
            <Text style={styles.title}>Health App Synced Biomarkers</Text>
            <Text style={styles.subTitle}>Apple Health & Health Connect Active</Text>
          </View>
        </View>
        <ChevronRight size={18} color="#64748B" />
      </View>

      {/* Metric 3-Column Grid */}
      <View style={styles.grid}>
        {/* Sleep */}
        <View style={styles.metricBox}>
          <View style={styles.metricHeader}>
            <Moon size={14} color="#38BDF8" />
            <Text style={styles.metricLabel}>SLEEP</Text>
          </View>
          <Text style={styles.metricValue}>{sleepHours} hrs</Text>
          <View style={[styles.badge, { backgroundColor: `${getQualityColor()}20` }]}>
            <Text style={[styles.badgeText, { color: getQualityColor() }]}>
              {sleepQuality.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* HRV Stress */}
        <View style={styles.metricBox}>
          <View style={styles.metricHeader}>
            <Heart size={14} color="#F43F5E" />
            <Text style={styles.metricLabel}>HRV STRESS</Text>
          </View>
          <Text style={styles.metricValue}>
            {hrvTrend === "increasing" ? "Low Stress" : hrvTrend === "stable" ? "Optimal" : "Elevated"}
          </Text>
          <View style={[styles.badge, { backgroundColor: "#10B98120" }]}>
            <Text style={[styles.badgeText, { color: "#10B981" }]}>RECOVERED</Text>
          </View>
        </View>

        {/* Cycle Phase */}
        <View style={styles.metricBox}>
          <View style={styles.metricHeader}>
            <Calendar size={14} color="#A855F7" />
            <Text style={styles.metricLabel}>CYCLE</Text>
          </View>
          <Text style={styles.metricValue}>{cyclePhase.toUpperCase()}</Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: isLutealHormonalRisk ? "#EF444420" : "#10B98120" },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: isLutealHormonalRisk ? "#EF4444" : "#10B981" },
              ]}
            >
              {isLutealHormonalRisk ? "FLARE RISK" : "NORMAL"}
            </Text>
          </View>
        </View>
      </View>

      {/* Contextual insight notice */}
      {isLutealHormonalRisk && (
        <View style={styles.insightBox}>
          <Text style={styles.insightText}>
            Progesterone spike detected in luteal phase: androgenic sebum activity elevated around chin and jawline. Keep BHA targeted in T-zone.
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EC489920",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F8FAFC",
  },
  subTitle: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1,
  },
  grid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  metricBox: {
    flex: 1,
    backgroundColor: "#0F172A",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#33415550",
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94A3B8",
  },
  metricValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#F8FAFC",
    marginBottom: 6,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "700",
  },
  insightBox: {
    marginTop: 12,
    backgroundColor: "#EF444410",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EF444425",
  },
  insightText: {
    fontSize: 11,
    color: "#FCA5A5",
    lineHeight: 16,
  },
});
