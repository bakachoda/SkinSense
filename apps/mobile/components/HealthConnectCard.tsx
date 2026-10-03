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
            <Activity size={16} color="#18181B" />
          </View>
          <View>
            <Text style={styles.badgeLabel}>BIOMARKER TELEMETRY</Text>
            <Text style={styles.title}>Physiological Signals</Text>
          </View>
        </View>
        <ChevronRight size={16} color="#A1A1AA" />
      </View>

      {/* Metric 3-Column Grid */}
      <View style={styles.grid}>
        {/* Sleep */}
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>SLEEP DURATION</Text>
          <Text style={styles.metricValue}>{sleepHours} hrs</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{sleepQuality.toUpperCase()}</Text>
          </View>
        </View>

        {/* HRV Stress */}
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>HRV STATUS</Text>
          <Text style={styles.metricValue}>
            {hrvTrend === "increasing" ? "Low Stress" : hrvTrend === "stable" ? "Optimal" : "Elevated"}
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>STEADY</Text>
          </View>
        </View>

        {/* Cycle Phase */}
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>HORMONAL CYCLE</Text>
          <Text style={styles.metricValue}>{cyclePhase.toUpperCase()}</Text>
          <View style={[styles.badge, isLutealHormonalRisk && styles.badgeCaution]}>
            <Text style={[styles.badgeText, isLutealHormonalRisk && styles.badgeTextCaution]}>
              {isLutealHormonalRisk ? "LUTEAL FLARE" : "NORMAL"}
            </Text>
          </View>
        </View>
      </View>

      {/* Contextual insight notice */}
      {isLutealHormonalRisk && (
        <View style={styles.insightBox}>
          <Text style={styles.insightText}>
            Progesterone elevation detected in luteal phase: androgenic sebum activity elevated around chin and jawline. Keep BHA targeted in T-zone.
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E4E4E7",
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
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: "#F4F4F5",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#71717A",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    color: "#18181B",
    marginTop: 1,
  },
  grid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  metricBox: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E4E4E7",
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#71717A",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#18181B",
    marginBottom: 6,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: "#F4F4F5",
    borderWidth: 1,
    borderColor: "#E4E4E7",
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#52525B",
    letterSpacing: 0.5,
  },
  badgeCaution: {
    backgroundColor: "#FEF3C7",
    borderColor: "#FDE68A",
  },
  badgeTextCaution: {
    color: "#B45309",
  },
  insightBox: {
    marginTop: 12,
    backgroundColor: "#F4F4F5",
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E4E4E7",
  },
  insightText: {
    fontSize: 11,
    color: "#52525B",
    lineHeight: 16,
  },
});

