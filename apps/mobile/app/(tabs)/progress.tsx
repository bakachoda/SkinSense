import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { ArrowDown, ArrowUp, Minus, Calendar, GitCompare } from "lucide-react-native";

interface ScanComparison {
  zone: string;
  concern: string;
  before: number;
  after: number;
  delta: number;
}

export default function ProgressScreen() {
  const [baselineDate] = useState("Sep 14, 2026");
  const [currentDate] = useState("Oct 01, 2026");

  const [comparisons] = useState<ScanComparison[]>([
    { zone: "Forehead", concern: "Acne", before: 78, after: 62, delta: -16 },
    { zone: "Forehead", concern: "Oiliness", before: 75, after: 65, delta: -10 },
    { zone: "Left Cheek", concern: "Acne", before: 68, after: 55, delta: -13 },
    { zone: "Left Cheek", concern: "Redness", before: 52, after: 38, delta: -14 },
    { zone: "Right Cheek", concern: "Redness", before: 48, after: 36, delta: -12 },
    { zone: "Nose", concern: "Texture", before: 60, after: 50, delta: -10 },
    { zone: "Chin", concern: "Acne", before: 58, after: 48, delta: -10 },
    { zone: "Periorbital", concern: "Dryness", before: 65, after: 42, delta: -23 },
  ]);

  const overallBefore = 72;
  const overallAfter = 81;
  const overallDelta = overallAfter - overallBefore;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Scan Comparison</Text>
          <Text style={styles.subtitle}>
            Side-by-side progression tracking across facial zones
          </Text>
        </View>

        {/* Side-by-side Scans Cards */}
        <View style={styles.compareHeroCard}>
          <View style={styles.scanCol}>
            <Text style={styles.scanBadge}>Baseline</Text>
            <View style={styles.dateRow}>
              <Calendar size={14} color="#9CA3AF" />
              <Text style={styles.scanDateText}>{baselineDate}</Text>
            </View>
            <Text style={styles.compareScore}>{overallBefore}</Text>
            <Text style={styles.scoreSub}>Health Index</Text>
          </View>

          <View style={styles.dividerCol}>
            <View style={styles.vsBadge}>
              <GitCompare size={16} color="#60A5FA" />
            </View>
            <Text style={styles.vsText}>VS</Text>
          </View>

          <View style={styles.scanCol}>
            <Text style={[styles.scanBadge, styles.scanBadgeCurrent]}>Current</Text>
            <View style={styles.dateRow}>
              <Calendar size={14} color="#9CA3AF" />
              <Text style={styles.scanDateText}>{currentDate}</Text>
            </View>
            <Text style={[styles.compareScore, { color: "#10B981" }]}>{overallAfter}</Text>
            <Text style={styles.scoreSub}>Health Index</Text>
          </View>
        </View>

        {/* Overall Delta Banner */}
        <View style={styles.overallBanner}>
          <View style={styles.deltaCircle}>
            <ArrowUp size={20} color="#10B981" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.overallBannerTitle}>
              +{overallDelta} Points Net Improvement
            </Text>
            <Text style={styles.overallBannerSub}>
              Noticeable reduction in inflammatory acne lesions and cheek erythema.
            </Text>
          </View>
        </View>

        {/* Per-Zone Delta Table (Section 7.2) */}
        <View style={styles.tableCard}>
          <Text style={styles.tableTitle}>Per-Zone Score Deltas</Text>

          <View style={styles.tableHeader}>
            <Text style={[styles.colHeader, { flex: 2 }]}>ZONE & CONCERN</Text>
            <Text style={[styles.colHeader, { flex: 1, textAlign: "center" }]}>BEFORE</Text>
            <Text style={[styles.colHeader, { flex: 1, textAlign: "center" }]}>AFTER</Text>
            <Text style={[styles.colHeader, { flex: 1, textAlign: "right" }]}>DELTA</Text>
          </View>

          {comparisons.map((row, idx) => (
            <View key={idx} style={styles.tableRow}>
              <View style={{ flex: 2 }}>
                <Text style={styles.rowZone}>{row.zone}</Text>
                <Text style={styles.rowConcern}>{row.concern}</Text>
              </View>

              <Text style={[styles.rowValue, { flex: 1, textAlign: "center" }]}>
                {row.before}
              </Text>

              <Text style={[styles.rowValue, { flex: 1, textAlign: "center", color: "#F3F4F6" }]}>
                {row.after}
              </Text>

              <View style={[styles.deltaCol, { flex: 1, alignItems: "flex-end" }]}>
                <View
                  style={[
                    styles.deltaBadge,
                    row.delta < 0 ? styles.deltaBadgeGood : styles.deltaBadgeNeutral,
                  ]}
                >
                  <Text
                    style={[
                      styles.deltaBadgeText,
                      row.delta < 0 ? styles.deltaBadgeTextGood : styles.deltaBadgeTextNeutral,
                    ]}
                  >
                    {row.delta < 0 ? `${row.delta}` : `+${row.delta}`}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
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
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#F9FAFB",
  },
  subtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 4,
  },
  compareHeroCard: {
    flexDirection: "row",
    backgroundColor: "#161E2E",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1F2937",
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
  },
  scanCol: {
    flex: 1,
    alignItems: "center",
  },
  scanBadge: {
    backgroundColor: "#1F2937",
    color: "#9CA3AF",
    fontSize: 11,
    fontWeight: "700",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  scanBadgeCurrent: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    color: "#10B981",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  scanDateText: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  compareScore: {
    fontSize: 40,
    fontWeight: "800",
    color: "#F3F4F6",
  },
  scoreSub: {
    fontSize: 11,
    color: "#6B7280",
    textTransform: "uppercase",
  },
  dividerCol: {
    alignItems: "center",
    paddingHorizontal: 12,
  },
  vsBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1F2937",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  vsText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
  },
  overallBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F281E",
    borderWidth: 1,
    borderColor: "#10B981",
    borderRadius: 16,
    padding: 16,
    gap: 14,
    marginBottom: 20,
  },
  deltaCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  overallBannerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#10B981",
    marginBottom: 2,
  },
  overallBannerSub: {
    fontSize: 12,
    color: "#6EE7B7",
    lineHeight: 16,
  },
  tableCard: {
    backgroundColor: "#161E2E",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1F2937",
    padding: 18,
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F9FAFB",
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
    paddingBottom: 10,
    marginBottom: 8,
  },
  colHeader: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#162235",
  },
  rowZone: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F3F4F6",
  },
  rowConcern: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  rowValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  deltaCol: {
    justifyContent: "center",
  },
  deltaBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  deltaBadgeGood: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
  },
  deltaBadgeNeutral: {
    backgroundColor: "#1F2937",
  },
  deltaBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  deltaBadgeTextGood: {
    color: "#10B981",
  },
  deltaBadgeTextNeutral: {
    color: "#9CA3AF",
  },
});
