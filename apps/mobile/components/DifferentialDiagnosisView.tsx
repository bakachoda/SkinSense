import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Stethoscope, ChevronDown, ChevronUp, MapPin, AlertCircle, HelpCircle } from "lucide-react-native";
import type { DifferentialDiagnosisResult } from "@skinsense/types";

interface DifferentialDiagnosisViewProps {
  differentialResult?: DifferentialDiagnosisResult | null;
}

export function DifferentialDiagnosisView({ differentialResult }: DifferentialDiagnosisViewProps) {
  const [expanded, setExpanded] = useState(false);

  if (!differentialResult || !differentialResult.primary) {
    return null;
  }

  const { primary, alternatives = [], spatialDistribution } = differentialResult;

  return (
    <View style={styles.cardContainer}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleBadge}>
          <Stethoscope size={18} color="#06B6D4" />
          <Text style={styles.cardTitle}>Spatial Differential Diagnosis</Text>
        </View>
        <View style={styles.primaryPill}>
          <Text style={styles.primaryPillText}>TOP MATCH</Text>
        </View>
      </View>

      {/* Spatial Distribution Callout */}
      <View style={styles.spatialBanner}>
        <MapPin size={14} color="#38BDF8" />
        <Text style={styles.spatialText}>{spatialDistribution}</Text>
      </View>

      {/* Primary Diagnosis Box */}
      <View style={styles.primaryBox}>
        <View style={styles.conditionTitleRow}>
          <Text style={styles.conditionName}>{primary.condition}</Text>
          <View style={styles.confidenceBadge}>
            <Text style={styles.confidenceText}>{Math.round(primary.confidence * 100)}% match</Text>
          </View>
        </View>
        <Text style={styles.clinicalNote}>{primary.note}</Text>

        <View style={styles.treatmentSection}>
          <Text style={styles.treatmentLabel}>Clinical Protocol Recommendation:</Text>
          <Text style={styles.treatmentText}>{primary.treatment}</Text>
        </View>

        {primary.followUpQuestion && (
          <View style={styles.followUpBox}>
            <HelpCircle size={14} color="#FBBF24" />
            <Text style={styles.followUpText}>{primary.followUpQuestion}</Text>
          </View>
        )}
      </View>

      {/* Alternative Differential Diagnoses */}
      {alternatives.length > 0 && (
        <View style={styles.alternativesSection}>
          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() => setExpanded(!expanded)}
            activeOpacity={0.7}
          >
            <Text style={styles.alternativesTitle}>
              {alternatives.length} Alternative Differential{alternatives.length > 1 ? "s" : ""}
            </Text>
            {expanded ? (
              <ChevronUp size={16} color="#94A3B8" />
            ) : (
              <ChevronDown size={16} color="#94A3B8" />
            )}
          </TouchableOpacity>

          {expanded && (
            <View style={styles.alternativesList}>
              {alternatives.map((alt, idx) => (
                <View key={idx} style={styles.alternativeItem}>
                  <View style={styles.altHeader}>
                    <Text style={styles.altName}>{alt.condition}</Text>
                    <Text style={styles.altConfidence}>{Math.round(alt.confidence * 100)}%</Text>
                  </View>
                  <Text style={styles.altNote}>{alt.note}</Text>
                  <Text style={styles.altTreatment}>Action: {alt.treatment}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Physician Referral Disclaimer */}
      <View style={styles.referralDisclaimer}>
        <AlertCircle size={13} color="#94A3B8" />
        <Text style={styles.disclaimerText}>
          Algorithm generates differential hypotheses based on morphological clustering. Consult a board-certified dermatologist for definitive biopsy or prescription management.
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
    marginBottom: 10,
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
  primaryPill: {
    backgroundColor: "rgba(6, 182, 212, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.4)",
  },
  primaryPillText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#22D3EE",
    letterSpacing: 0.5,
  },
  spatialBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(56, 189, 248, 0.08)",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.2)",
    marginBottom: 12,
  },
  spatialText: {
    fontSize: 11,
    color: "#BAE6FD",
    flex: 1,
    fontWeight: "500",
    lineHeight: 16,
  },
  primaryBox: {
    backgroundColor: "#0B111E",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    marginBottom: 10,
  },
  conditionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  conditionName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#F8FAFC",
  },
  confidenceBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#34D399",
  },
  clinicalNote: {
    fontSize: 12,
    color: "#94A3B8",
    lineHeight: 18,
    marginBottom: 10,
  },
  treatmentSection: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    padding: 10,
    borderRadius: 8,
  },
  treatmentLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  treatmentText: {
    fontSize: 12,
    color: "#E2E8F0",
    fontWeight: "600",
    lineHeight: 17,
  },
  followUpBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    padding: 8,
    borderRadius: 6,
  },
  followUpText: {
    fontSize: 11,
    color: "#FCD34D",
    flex: 1,
  },
  alternativesSection: {
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
    paddingTop: 8,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  alternativesTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94A3B8",
  },
  alternativesList: {
    marginTop: 8,
    gap: 8,
  },
  alternativeItem: {
    backgroundColor: "#0B111E",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  altHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  altName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#CBD5E1",
  },
  altConfidence: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
  },
  altNote: {
    fontSize: 11,
    color: "#64748B",
    lineHeight: 15,
    marginBottom: 4,
  },
  altTreatment: {
    fontSize: 11,
    color: "#94A3B8",
    fontStyle: "italic",
  },
  referralDisclaimer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
  },
  disclaimerText: {
    fontSize: 10,
    color: "#64748B",
    lineHeight: 14,
    flex: 1,
  },
});
