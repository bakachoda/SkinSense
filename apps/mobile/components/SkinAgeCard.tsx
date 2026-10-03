import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Sparkles, Calendar, TrendingDown, TrendingUp } from "lucide-react-native";
import type { SkinAgeResult } from "@skinsense/types";

interface SkinAgeCardProps {
  skinAgeResult?: SkinAgeResult | null;
  fallbackChronological?: number;
}

export function SkinAgeCard({ skinAgeResult, fallbackChronological = 26 }: SkinAgeCardProps) {
  const bioAge = skinAgeResult?.biologicalAge ?? 24;
  const chronoAge = skinAgeResult?.chronologicalAge ?? fallbackChronological;
  const delta = skinAgeResult?.delta ?? (bioAge - chronoAge);
  const isYounger = delta <= 0;

  return (
    <View style={styles.cardContainer}>
      <View style={styles.headerRow}>
        <View style={styles.titleBadge}>
          <Sparkles size={17} color="#A855F7" />
          <Text style={styles.cardTitle}>Biological Skin Age Model</Text>
        </View>
        <View style={styles.chronoBadge}>
          <Calendar size={12} color="#94A3B8" />
          <Text style={styles.chronoText}>Calendar: {chronoAge}y</Text>
        </View>
      </View>

      <View style={styles.mainMetricsRow}>
        <View style={styles.bioMetric}>
          <Text style={styles.bioAgeNumber}>{bioAge}</Text>
          <Text style={styles.bioAgeLabel}>years biological</Text>
        </View>

        <View
          style={[
            styles.deltaPill,
            {
              backgroundColor: isYounger ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
              borderColor: isYounger ? "rgba(16, 185, 129, 0.4)" : "rgba(245, 158, 11, 0.4)",
            },
          ]}
        >
          {isYounger ? (
            <TrendingDown size={14} color="#34D399" />
          ) : (
            <TrendingUp size={14} color="#FBBF24" />
          )}
          <Text
            style={[
              styles.deltaText,
              { color: isYounger ? "#34D399" : "#FBBF24" },
            ]}
          >
            {delta === 0 ? "Equal to Calendar" : `${Math.abs(delta)}y ${isYounger ? "Younger" : "Matured"}`}
          </Text>
        </View>
      </View>

      {/* Zone-by-Zone Breakdown */}
      {skinAgeResult?.zoneAges && (
        <View style={styles.zoneGrid}>
          {Object.entries(skinAgeResult.zoneAges).map(([zone, age]) => {
            const zDelta = (age as number) - chronoAge;
            const zYounger = zDelta <= 0;
            return (
              <View key={zone} style={styles.zoneTile}>
                <Text style={styles.zoneName}>{zone.replace("_", " ").toUpperCase()}</Text>
                <Text style={styles.zoneAgeText}>{age}y</Text>
                <Text
                  style={[
                    styles.zoneDeltaText,
                    { color: zYounger ? "#34D399" : "#FBBF24" },
                  ]}
                >
                  {zDelta > 0 ? `+${zDelta}y` : `${zDelta}y`}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Contributing Factors */}
      {skinAgeResult?.primaryContributingFactors && skinAgeResult.primaryContributingFactors.length > 0 && (
        <View style={styles.factorsSection}>
          <Text style={styles.factorsHeader}>Biophysical Age Drivers:</Text>
          {skinAgeResult.primaryContributingFactors.map((f, idx) => (
            <View key={idx} style={styles.factorItem}>
              <View style={styles.bulletDot} />
              <Text style={styles.factorText}>{f.impact}</Text>
            </View>
          ))}
        </View>
      )}
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
  chronoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#1E293B",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  chronoText: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
  },
  mainMetricsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  bioMetric: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  bioAgeNumber: {
    fontSize: 32,
    fontWeight: "800",
    color: "#C084FC",
  },
  bioAgeLabel: {
    fontSize: 13,
    color: "#94A3B8",
    fontWeight: "600",
  },
  deltaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  deltaText: {
    fontSize: 12,
    fontWeight: "700",
  },
  zoneGrid: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 12,
  },
  zoneTile: {
    flex: 1,
    backgroundColor: "#0B111E",
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  zoneName: {
    fontSize: 9,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 2,
  },
  zoneAgeText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#F8FAFC",
  },
  zoneDeltaText: {
    fontSize: 10,
    fontWeight: "700",
  },
  factorsSection: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
  },
  factorsHeader: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  factorItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: 4,
  },
  bulletDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#A855F7",
    marginTop: 6,
  },
  factorText: {
    fontSize: 12,
    color: "#CBD5E1",
    lineHeight: 16,
    flex: 1,
  },
});
