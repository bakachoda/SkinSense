import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Sun, AlertTriangle, XCircle, CheckCircle, ArrowUp, Compass } from "lucide-react-native";
import type { EnvironmentQualityScore } from "@skinsense/types";

interface EnvironmentQualityGateProps {
  score: EnvironmentQualityScore;
  colorTempK?: number;
  advice?: string;
  onCalibrateWhite?: () => void;
  isCalibrated?: boolean;
}

export function EnvironmentQualityGate({
  score,
  colorTempK = 5400,
  advice,
  onCalibrateWhite,
  isCalibrated = false,
}: EnvironmentQualityGateProps) {
  const getBadgeStyle = () => {
    switch (score) {
      case "green":
        return {
          bg: "rgba(16, 185, 129, 0.15)",
          border: "#10B981",
          text: "#10B981",
          icon: <CheckCircle size={14} color="#10B981" />,
          label: "Optimal Lighting",
        };
      case "yellow":
        return {
          bg: "rgba(245, 158, 11, 0.15)",
          border: "#F59E0B",
          text: "#F59E0B",
          icon: <AlertTriangle size={14} color="#F59E0B" />,
          label: "Uneven Lighting",
        };
      case "red":
      default:
        return {
          bg: "rgba(239, 68, 68, 0.15)",
          border: "#EF4444",
          text: "#EF4444",
          icon: <XCircle size={14} color="#EF4444" />,
          label: "Poor Lighting (Blocked)",
        };
    }
  };

  const badge = getBadgeStyle();

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {/* Status Pill */}
        <View style={[styles.badge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
          {badge.icon}
          <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
        </View>

        {/* Color Temp Indicator */}
        <View style={styles.tempBadge}>
          <Sun size={12} color="#94A3B8" />
          <Text style={styles.tempText}>{colorTempK}K</Text>
        </View>

        {/* White Reference Calibration status */}
        {onCalibrateWhite && (
          <TouchableOpacity
            style={[styles.calibBtn, isCalibrated && styles.calibBtnDone]}
            onPress={onCalibrateWhite}
            activeOpacity={0.8}
          >
            <Compass size={12} color={isCalibrated ? "#10B981" : "#94A3B8"} />
            <Text style={[styles.calibText, isCalibrated && styles.calibTextDone]}>
              {isCalibrated ? "Calibrated (D65)" : "White Ref"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Advisory Message */}
      {advice && (
        <View style={styles.adviceRow}>
          <ArrowUp size={13} color="#94A3B8" />
          <Text style={styles.adviceText}>{advice}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    marginHorizontal: 16,
    marginBottom: 10,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  tempBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(30, 41, 59, 0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tempText: {
    fontSize: 11,
    color: "#CBD5E1",
    fontWeight: "600",
  },
  calibBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#1E293B",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#334155",
  },
  calibBtnDone: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderColor: "#10B981",
  },
  calibText: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
  },
  calibTextDone: {
    color: "#10B981",
  },
  adviceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
  },
  adviceText: {
    fontSize: 11,
    color: "#94A3B8",
  },
});
