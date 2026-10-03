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
import { BarChart3, ArrowDown, ArrowUp, Minus, Calendar, GitCompare } from "lucide-react-native";
import { apiClient } from "../../lib/api-client";
import { SkinTimelineChart } from "../../components/SkinTimelineChart";
import type { SkinTimeline, TrendWindow } from "@skinsense/types";

const WINDOWS: { label: string; value: TrendWindow }[] = [
  { label: "7D", value: "7d" },
  { label: "30D", value: "30d" },
  { label: "90D", value: "90d" },
  { label: "All", value: "all" },
];

// Comparison data (kept from original progress screen)
interface ScanComparison {
  zone: string;
  concern: string;
  before: number;
  after: number;
  delta: number;
}

export default function ProgressScreen() {
  const [window, setWindow] = useState<TrendWindow>("30d");
  const [timeline, setTimeline] = useState<SkinTimeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const userId = "user-1";

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

  const loadTimeline = async () => {
    try {
      const res = await apiClient.getTimeline(userId, window);
      setTimeline(res?.timeline ?? null);
    } catch {
      // Synthetic timeline for offline preview
      setTimeline({
        overallScoreHistory: [
          { date: "2026-09-01T00:00:00Z", value: 65, scanId: "s1" },
          { date: "2026-09-08T00:00:00Z", value: 68, scanId: "s2" },
          { date: "2026-09-15T00:00:00Z", value: 72, scanId: "s3" },
          { date: "2026-09-22T00:00:00Z", value: 70, scanId: "s4" },
          { date: "2026-10-01T00:00:00Z", value: 78, scanId: "s5" },
        ],
        concernTrends: [
          {
            concern: "acne", zone: "left_cheek", direction: "improving", slope: -1.2,
            dataPoints: [
              { date: "2026-09-01T00:00:00Z", value: 68 },
              { date: "2026-09-15T00:00:00Z", value: 55 },
              { date: "2026-10-01T00:00:00Z", value: 45 },
            ],
            currentValue: 45, previousValue: 68, delta: -23, confidence: 0.85,
          },
          {
            concern: "redness", zone: "right_cheek", direction: "improving", slope: -0.8,
            dataPoints: [
              { date: "2026-09-01T00:00:00Z", value: 48 },
              { date: "2026-09-15T00:00:00Z", value: 40 },
              { date: "2026-10-01T00:00:00Z", value: 30 },
            ],
            currentValue: 30, previousValue: 48, delta: -18, confidence: 0.78,
          },
          {
            concern: "dryness", zone: "periorbital", direction: "improving", slope: -1.5,
            dataPoints: [
              { date: "2026-09-01T00:00:00Z", value: 65 },
              { date: "2026-09-15T00:00:00Z", value: 50 },
              { date: "2026-10-01T00:00:00Z", value: 42 },
            ],
            currentValue: 42, previousValue: 65, delta: -23, confidence: 0.82,
          },
          {
            concern: "oiliness", zone: "nose", direction: "stable", slope: -0.3,
            dataPoints: [
              { date: "2026-09-01T00:00:00Z", value: 70 },
              { date: "2026-09-15T00:00:00Z", value: 68 },
              { date: "2026-10-01T00:00:00Z", value: 65 },
            ],
            currentValue: 65, previousValue: 70, delta: -5, confidence: 0.65,
          },
        ],
        breakpoints: [
          {
            date: "2026-09-22T00:00:00Z", concern: "skinHealthScore", zone: "overall",
            type: "valley", valueBefore: 72, valueAfter: 78,
            possibleCause: "Skin stress detected — possibly environmental or routine change",
          },
        ],
        seasonalPatterns: [],
        totalScans: 5,
        firstScanDate: "2026-09-01T00:00:00Z",
        latestScanDate: "2026-10-01T00:00:00Z",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadTimeline();
  }, [window]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadTimeline(); }}
            tintColor="#10B981"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.brandTitle}>PROGRESSION METRICS</Text>
          <Text style={styles.brandSubtitle}>
            Clinical Delta & Zone Telemetry
          </Text>
        </View>

        {/* Window Selector */}
        <View style={styles.windowRow}>
          {WINDOWS.map((w) => (
            <TouchableOpacity
              key={w.value}
              onPress={() => setWindow(w.value)}
              style={[styles.windowBtn, window === w.value && styles.windowBtnActive]}
            >
              <Text style={[styles.windowText, window === w.value && styles.windowTextActive]}>
                {w.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Timeline Chart */}
        {loading ? (
          <ActivityIndicator size="small" color="#111827" style={{ marginVertical: 40 }} />
        ) : timeline ? (
          <SkinTimelineChart
            timeline={timeline}
            windowLabel={WINDOWS.find((w) => w.value === window)?.label || "30D"}
          />
        ) : null}

        {/* Scan Comparison Section */}
        <View style={styles.compareSection}>
          <Text style={styles.compareTitle}>ZONE COMPARISON ANALYSIS</Text>
          <Text style={styles.compareSub}>
            Direct delta tracking between diagnostic intervals
          </Text>

          {/* Side-by-side hero */}
          <View style={styles.compareHeroCard}>
            <View style={styles.scanCol}>
              <Text style={styles.scanBadge}>BASELINE</Text>
              <View style={styles.dateRow}>
                <Calendar size={12} color="#6B7280" />
                <Text style={styles.scanDateText}>{baselineDate}</Text>
              </View>
              <Text style={styles.compareScore}>{overallBefore}</Text>
              <Text style={styles.scoreSub}>HEALTH INDEX</Text>
            </View>

            <View style={styles.dividerCol}>
              <View style={styles.vsBadge}>
                <GitCompare size={14} color="#111827" />
              </View>
              <Text style={styles.vsText}>VS</Text>
            </View>

            <View style={styles.scanCol}>
              <Text style={[styles.scanBadge, styles.scanBadgeCurrent]}>CURRENT</Text>
              <View style={styles.dateRow}>
                <Calendar size={12} color="#6B7280" />
                <Text style={styles.scanDateText}>{currentDate}</Text>
              </View>
              <Text style={[styles.compareScore, { color: "#111827" }]}>{overallAfter}</Text>
              <Text style={styles.scoreSub}>HEALTH INDEX</Text>
            </View>
          </View>

          {/* Zone Comparisons */}
          {comparisons.map((comp, i) => {
            const improved = comp.delta < 0;
            return (
              <View key={i} style={styles.zoneCompareRow}>
                <View style={styles.zoneLabel}>
                  <Text style={styles.zoneName}>{comp.zone}</Text>
                  <Text style={styles.zoneConcern}>{comp.concern}</Text>
                </View>
                <View style={styles.barContainer}>
                  <View style={[styles.barBefore, { width: `${comp.before}%` }]} />
                  <View
                    style={[
                      styles.barAfter,
                      { width: `${comp.after}%`, backgroundColor: improved ? "#111827" : "#DC2626" },
                    ]}
                  />
                </View>
                <View style={styles.deltaBox}>
                  {improved ? (
                    <ArrowDown size={12} color="#111827" />
                  ) : (
                    <ArrowUp size={12} color="#DC2626" />
                  )}
                  <Text
                    style={[
                      styles.deltaTextComp,
                      { color: improved ? "#111827" : "#DC2626" },
                    ]}
                  >
                    {Math.abs(comp.delta)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: "600",
    color: "#6B7280",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginTop: 2,
  },
  windowRow: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 3,
    marginBottom: 16,
  },
  windowBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 6,
    alignItems: "center",
  },
  windowBtnActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  windowText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6B7280",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  windowTextActive: {
    color: "#111827",
  },
  compareSection: {
    marginTop: 20,
  },
  compareTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  compareSub: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 2,
    marginBottom: 14,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  compareHeroCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
    alignItems: "center",
  },
  scanCol: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  scanBadge: {
    fontSize: 9,
    fontWeight: "800",
    color: "#6B7280",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    overflow: "hidden",
    letterSpacing: 1,
  },
  scanBadgeCurrent: {
    backgroundColor: "#111827",
    color: "#FFFFFF",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  scanDateText: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "600",
  },
  compareScore: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
  },
  scoreSub: {
    fontSize: 9,
    color: "#9CA3AF",
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  dividerCol: {
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
  },
  vsBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  vsText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#6B7280",
    letterSpacing: 1,
  },
  zoneCompareRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 8,
    gap: 10,
  },
  zoneLabel: {
    width: 90,
  },
  zoneName: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
  },
  zoneConcern: {
    fontSize: 10,
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  barContainer: {
    flex: 1,
    height: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
    overflow: "hidden",
    position: "relative",
  },
  barBefore: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
  },
  barAfter: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    borderRadius: 6,
  },
  deltaBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    width: 36,
    justifyContent: "flex-end",
  },
  deltaTextComp: {
    fontSize: 11,
    fontWeight: "800",
  },
});
