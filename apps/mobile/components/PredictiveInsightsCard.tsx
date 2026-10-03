import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { BreakoutPrediction, SunDamageTrajectory, DehydrationForecast, RiskLevel } from "@skinsense/types";

interface PredictiveInsightsCardProps {
  predictions?: {
    breakout?: BreakoutPrediction;
    sunDamage?: SunDamageTrajectory;
    dehydration?: DehydrationForecast;
  };
}

export function PredictiveInsightsCard({ predictions }: PredictiveInsightsCardProps) {
  const [selectedTab, setSelectedTab] = useState<"breakout" | "sun" | "dehydration">("breakout");

  // Defaults if not provided
  const breakout: BreakoutPrediction = predictions?.breakout || {
    type: "breakout",
    riskLevel: "high",
    confidence: 0.88,
    timeframe: "24-48 hours",
    recommendation: "High breakout probability in 24-48h. Spot-treat follicular congestion with 2% Salicylic Acid and apply non-comedogenic hydration tonight.",
    triggerFactors: [
      "Elevated P. acnes porphyrin fluorescence",
      "Micro-comedone pore blockage",
      "Surge in specular sebum output",
    ],
  };

  const sunDamage: SunDamageTrajectory = predictions?.sunDamage || {
    type: "sun_damage",
    currentAge: 26,
    currentScore: 28,
    projectedAge50: 42.1,
    projectedAge60: 58.4,
    projectedAge70: 74.2,
    riskLevel: "medium",
    recommendation: "Moderate photo-aging velocity. Incorporate daily SPF 50+ and topical antioxidants to decelerate dermal elastin degradation.",
    message: "At your current velocity, cumulative UV damage is projected to reach 58.4/100 by age 60. Broad-spectrum SPF compliance can reduce this progression by up to 48%.",
  };

  const dehydration: DehydrationForecast = predictions?.dehydration || {
    type: "dehydration",
    riskLevel: "high",
    confidence: 0.91,
    recommendation: "Severe drying environmental index (humidity <30%, elevated wind). Apply a ceramide barrier cream, mist with hyaluronic acid, and sleep with a cool-mist humidifier.",
    weatherIndicators: {
      humidityPercent: 24,
      tempF: 86,
      windMph: 15,
    },
  };

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case "high":
        return "#EF4444";
      case "medium":
        return "#F59E0B";
      case "low":
        return "#10B981";
    }
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <MaterialCommunityIcons name="crystal-ball" size={20} color="#A855F7" />
          <Text style={styles.title}>Predictive Skin Analytics</Text>
        </View>
        <View style={styles.forecastBadge}>
          <Text style={styles.forecastText}>AI Forecast</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, selectedTab === "breakout" && styles.tabActive]}
          onPress={() => setSelectedTab("breakout")}
        >
          <Text style={[styles.tabText, selectedTab === "breakout" && styles.tabTextActive]}>
            Breakout (48h)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, selectedTab === "sun" && styles.tabActive]}
          onPress={() => setSelectedTab("sun")}
        >
          <Text style={[styles.tabText, selectedTab === "sun" && styles.tabTextActive]}>
            Sun Trajectory
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, selectedTab === "dehydration" && styles.tabActive]}
          onPress={() => setSelectedTab("dehydration")}
        >
          <Text style={[styles.tabText, selectedTab === "dehydration" && styles.tabTextActive]}>
            Dehydration Risk
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab 1: Breakout Forecast */}
      {selectedTab === "breakout" && (
        <View style={styles.contentWrap}>
          <View style={styles.riskHeader}>
            <View>
              <Text style={styles.metaLabel}>TIMEFRAME: {breakout.timeframe}</Text>
              <Text style={[styles.riskLevelText, { color: getRiskColor(breakout.riskLevel) }]}>
                {breakout.riskLevel.toUpperCase()} BREAKOUT RISK
              </Text>
            </View>
            <View style={[styles.confidencePill, { backgroundColor: "rgba(168, 85, 247, 0.15)" }]}>
              <Text style={styles.confidenceText}>
                {Math.round(breakout.confidence * 100)}% Confidence
              </Text>
            </View>
          </View>

          {/* Trigger Factors */}
          <Text style={styles.subhead}>Biophysical Triggers Detected</Text>
          <View style={styles.triggerChipsWrap}>
            {breakout.triggerFactors.map((factor, idx) => (
              <View key={idx} style={styles.triggerChip}>
                <MaterialCommunityIcons name="alert-decagram" size={12} color="#F59E0B" />
                <Text style={styles.triggerText}>{factor}</Text>
              </View>
            ))}
          </View>

          {/* Clinical Action */}
          <View style={styles.recommendationBox}>
            <MaterialCommunityIcons name="shield-check" size={16} color="#06B6D4" />
            <Text style={styles.recommendationText}>{breakout.recommendation}</Text>
          </View>
        </View>
      )}

      {/* Tab 2: Sun Damage Trajectory */}
      {selectedTab === "sun" && (
        <View style={styles.contentWrap}>
          <View style={styles.riskHeader}>
            <View>
              <Text style={styles.metaLabel}>LONGITUDINAL PHOTO-AGING</Text>
              <Text style={[styles.riskLevelText, { color: getRiskColor(sunDamage.riskLevel) }]}>
                {sunDamage.riskLevel.toUpperCase()} VELOCITY
              </Text>
            </View>
            <Text style={styles.ageBadge}>Age {sunDamage.currentAge}</Text>
          </View>

          {/* Trajectory Bar Progression */}
          <View style={styles.progressionBox}>
            <View style={styles.progressRow}>
              <Text style={styles.progAge}>Now ({sunDamage.currentAge})</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${sunDamage.currentScore}%`, backgroundColor: "#10B981" }]} />
              </View>
              <Text style={styles.progScore}>{sunDamage.currentScore}/100</Text>
            </View>
            <View style={styles.progressRow}>
              <Text style={styles.progAge}>Age 50</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${sunDamage.projectedAge50}%`, backgroundColor: "#F59E0B" }]} />
              </View>
              <Text style={styles.progScore}>{sunDamage.projectedAge50}/100</Text>
            </View>
            <View style={styles.progressRow}>
              <Text style={styles.progAge}>Age 60</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${sunDamage.projectedAge60}%`, backgroundColor: "#EF4444" }]} />
              </View>
              <Text style={styles.progScore}>{sunDamage.projectedAge60}/100</Text>
            </View>
          </View>

          <Text style={styles.trajectoryMessage}>{sunDamage.message}</Text>
        </View>
      )}

      {/* Tab 3: Dehydration Weather Forecast */}
      {selectedTab === "dehydration" && (
        <View style={styles.contentWrap}>
          <View style={styles.riskHeader}>
            <View>
              <Text style={styles.metaLabel}>ENVIRONMENTAL BARRIER RISK</Text>
              <Text style={[styles.riskLevelText, { color: getRiskColor(dehydration.riskLevel) }]}>
                {dehydration.riskLevel.toUpperCase()} DEHYDRATION
              </Text>
            </View>
          </View>

          {/* Weather Indicator Grid */}
          <View style={styles.weatherGrid}>
            <View style={styles.weatherItem}>
              <MaterialCommunityIcons name="water-percent" size={18} color="#06B6D4" />
              <Text style={styles.weatherVal}>{dehydration.weatherIndicators.humidityPercent}%</Text>
              <Text style={styles.weatherKey}>Humidity</Text>
            </View>
            <View style={styles.weatherItem}>
              <MaterialCommunityIcons name="thermometer" size={18} color="#F59E0B" />
              <Text style={styles.weatherVal}>{dehydration.weatherIndicators.tempF}°F</Text>
              <Text style={styles.weatherKey}>Ambient Temp</Text>
            </View>
            <View style={styles.weatherItem}>
              <MaterialCommunityIcons name="weather-windy" size={18} color="#A855F7" />
              <Text style={styles.weatherVal}>{dehydration.weatherIndicators.windMph} mph</Text>
              <Text style={styles.weatherKey}>Wind Stress</Text>
            </View>
          </View>

          <View style={styles.recommendationBox}>
            <MaterialCommunityIcons name="shield-sun" size={16} color="#10B981" />
            <Text style={styles.recommendationText}>{dehydration.recommendation}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#131B2E",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(168, 85, 247, 0.25)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    color: "#F8FAFC",
    fontSize: 15,
    fontWeight: "800",
  },
  forecastBadge: {
    backgroundColor: "rgba(168, 85, 247, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  forecastText: {
    color: "#A855F7",
    fontSize: 10,
    fontWeight: "700",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#0B0F17",
    borderRadius: 10,
    padding: 3,
    marginBottom: 12,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 7,
    alignItems: "center",
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: "rgba(168, 85, 247, 0.2)",
  },
  tabText: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "700",
  },
  tabTextActive: {
    color: "#C084FC",
  },
  contentWrap: {
    marginTop: 4,
  },
  riskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  metaLabel: {
    color: "#64748B",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  riskLevelText: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  confidencePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  confidenceText: {
    color: "#C084FC",
    fontSize: 10,
    fontWeight: "700",
  },
  subhead: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 6,
  },
  triggerChipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 10,
  },
  triggerChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0B0F17",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 5,
  },
  triggerText: {
    color: "#CBD5E1",
    fontSize: 11,
  },
  recommendationBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#0B0F17",
    padding: 10,
    borderRadius: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  recommendationText: {
    color: "#E2E8F0",
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  ageBadge: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "600",
  },
  progressionBox: {
    backgroundColor: "#0B0F17",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    gap: 8,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progAge: {
    color: "#94A3B8",
    fontSize: 11,
    width: 60,
  },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: "#1E293B",
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 3,
  },
  progScore: {
    color: "#F8FAFC",
    fontSize: 11,
    fontWeight: "700",
    width: 50,
    textAlign: "right",
  },
  trajectoryMessage: {
    color: "#94A3B8",
    fontSize: 11,
    lineHeight: 15,
  },
  weatherGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#0B0F17",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  weatherItem: {
    alignItems: "center",
    flex: 1,
  },
  weatherVal: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 4,
  },
  weatherKey: {
    color: "#64748B",
    fontSize: 10,
    marginTop: 2,
  },
});
