import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Award, Activity } from "lucide-react-native";
import type { ClinicalGradingResult } from "@skinsense/types";

interface ClinicalGradingCardProps {
  clinicalGrading?: ClinicalGradingResult | null;
}

export function ClinicalGradingCard({ clinicalGrading }: ClinicalGradingCardProps) {
  if (!clinicalGrading) return null;

  const { gagsScore, gagsSeverity, igaScore, igaLabel } = clinicalGrading;

  const getSeverityColor = (sev: string) => {
    switch (sev.toUpperCase()) {
      case "CLEAR":
      case "NONE":
        return "#10B981";
      case "MILD":
      case "ALMOST CLEAR":
        return "#06B6D4";
      case "MODERATE":
        return "#F59E0B";
      case "SEVERE":
      case "VERY_SEVERE":
      case "VERY SEVERE":
      default:
        return "#EF4444";
    }
  };

  const gagsColor = getSeverityColor(gagsSeverity || "Mild");
  const igaColor = getSeverityColor(igaLabel || "Mild");

  return (
    <View style={styles.cardContainer}>
      <View style={styles.headerRow}>
        <View style={styles.titleBadge}>
          <Award size={18} color="#F59E0B" />
          <Text style={styles.cardTitle}>Clinical Dermatological Grading</Text>
        </View>
        <Text style={styles.clinicalStandard}>FDA / GAGS Standards</Text>
      </View>

      <View style={styles.metricsRow}>
        {/* GAGS Metric */}
        <View style={styles.metricBox}>
          <Text style={styles.metricName}>GAGS Acne Score</Text>
          <View style={styles.scoreRow}>
            <Text style={[styles.scoreValue, { color: gagsColor }]}>{gagsScore}</Text>
            <Text style={styles.scoreMax}>/ 44</Text>
          </View>
          <View style={[styles.severityPill, { backgroundColor: `${gagsColor}18` }]}>
            <Text style={[styles.severityText, { color: gagsColor }]}>{gagsSeverity}</Text>
          </View>
        </View>

        {/* IGA Metric */}
        <View style={styles.metricBox}>
          <Text style={styles.metricName}>IGA Clinical Scale</Text>
          <View style={styles.scoreRow}>
            <Text style={[styles.scoreValue, { color: igaColor }]}>Grade {igaScore}</Text>
            <Text style={styles.scoreMax}>/ 4</Text>
          </View>
          <View style={[styles.severityPill, { backgroundColor: `${igaColor}18` }]}>
            <Text style={[styles.severityText, { color: igaColor }]}>{igaLabel}</Text>
          </View>
        </View>
      </View>

      <View style={styles.infoFooter}>
        <Activity size={12} color="#94A3B8" />
        <Text style={styles.footerNote}>
          Calculated using density factors across 6 anatomical facial units.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#131B2E",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1E293B",
    marginTop: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  titleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F8FAFC",
  },
  clinicalStandard: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  metricsRow: {
    flexDirection: "row",
    gap: 10,
  },
  metricBox: {
    flex: 1,
    backgroundColor: "#0B111E",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  metricName: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
    marginBottom: 6,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 22,
    fontWeight: "800",
  },
  scoreMax: {
    fontSize: 12,
    color: "#64748B",
    marginLeft: 4,
    fontWeight: "600",
  },
  severityPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  severityText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  infoFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
  },
  footerNote: {
    fontSize: 10,
    color: "#64748B",
    flex: 1,
  },
});
