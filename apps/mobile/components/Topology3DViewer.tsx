import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface Topology3DViewerProps {
  topology?: {
    classification?: string;
    lesionHeightMm?: number;
    surroundingPlaneNormal?: number[];
    poreAnalysis?: {
      averageDepthMm: number;
      maxDepthMm: number;
      congestionScore: number;
      poreCount: number;
    };
  };
  elasticity?: {
    overallGrade?: string;
    recoveryTimeMs?: number;
    firmnessScore?: number;
    zoneMetrics?: any;
  };
  rppg?: {
    perfusionScore?: number;
    peakBpm?: number;
    inflammationStatus?: string;
    capillaryDilationIndex?: number;
    isVascularRosaceaPattern?: boolean;
    subclinicalInflammationDetected?: boolean;
  };
}

export function Topology3DViewer({
  topology,
  elasticity,
  rppg,
}: Topology3DViewerProps) {
  const [activeTab, setActiveTab] = useState<"topology" | "perfusion" | "elasticity">("topology");

  // Defaults if not provided
  const topo = topology || {
    classification: "raised",
    lesionHeightMm: 1.6,
    poreAnalysis: {
      averageDepthMm: 0.35,
      maxDepthMm: 0.72,
      congestionScore: 6.8,
      poreCount: 142,
    },
  };

  const perf = rppg || {
    perfusionScore: 8.5,
    peakBpm: 72,
    inflammationStatus: "active",
    capillaryDilationIndex: 7.7,
    isVascularRosaceaPattern: false,
    subclinicalInflammationDetected: true,
  };

  const elast = elasticity || {
    overallGrade: "good",
    recoveryTimeMs: 259,
    firmnessScore: 8.7,
  };

  const isRaised = topo.classification === "raised";
  const isDepressed = topo.classification === "depressed";
  const topoColor = isRaised ? "#F59E0B" : isDepressed ? "#06B6D4" : "#10B981";

  const isInflamed = perf.inflammationStatus === "active";
  const perfColor = isInflamed ? "#EF4444" : "#10B981";

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <MaterialCommunityIcons name="cube-scan" size={20} color="#06B6D4" />
          <Text style={styles.title}>Multi-Sensor Diagnostic Lab</Text>
        </View>
        <View style={styles.pillBadge}>
          <Text style={styles.pillText}>Phase 5 Sensors</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === "topology" && styles.tabActive]}
          onPress={() => setActiveTab("topology")}
        >
          <Text style={[styles.tabText, activeTab === "topology" && styles.tabTextActive]}>
            3D Topology
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === "perfusion" && styles.tabActive]}
          onPress={() => setActiveTab("perfusion")}
        >
          <Text style={[styles.tabText, activeTab === "perfusion" && styles.tabTextActive]}>
            rPPG Blood Flow
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === "elasticity" && styles.tabActive]}
          onPress={() => setActiveTab("elasticity")}
        >
          <Text style={[styles.tabText, activeTab === "elasticity" && styles.tabTextActive]}>
            240fps Elasticity
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab 1: 3D Topology & Depth */}
      {activeTab === "topology" && (
        <View style={styles.tabContent}>
          <View style={styles.topoCard}>
            <View style={styles.topoMainRow}>
              <View>
                <Text style={styles.sectionLabel}>Lesion Morphology</Text>
                <Text style={[styles.topoClassification, { color: topoColor }]}>
                  {topo.classification?.toUpperCase()} LESION
                </Text>
                <Text style={styles.topoDetail}>
                  Fitted plane offset: {topo.lesionHeightMm ? `${topo.lesionHeightMm > 0 ? "+" : ""}${topo.lesionHeightMm} mm` : "+1.6 mm"}
                </Text>
              </View>
              <View style={[styles.topoIconBox, { backgroundColor: `${topoColor}20` }]}>
                <MaterialCommunityIcons
                  name={isRaised ? "arrow-top-right-thick" : isDepressed ? "arrow-bottom-right-thick" : "minus"}
                  size={26}
                  color={topoColor}
                />
              </View>
            </View>

            <View style={styles.gaugeContainer}>
              <View style={styles.gaugeLabels}>
                <Text style={styles.gaugeText}>Depressed (-2mm)</Text>
                <Text style={styles.gaugeText}>Flat (0)</Text>
                <Text style={styles.gaugeText}>Raised (+2mm)</Text>
              </View>
              <View style={styles.gaugeTrack}>
                <View
                  style={[
                    styles.gaugeIndicator,
                    {
                      left: isRaised ? "75%" : isDepressed ? "25%" : "50%",
                      backgroundColor: topoColor,
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Pore Depth Card */}
          {topo.poreAnalysis && (
            <View style={styles.poreCard}>
              <Text style={styles.sectionLabel}>Follicular & Pore Depth Profiling</Text>
              <View style={styles.poreGrid}>
                <View style={styles.poreGridItem}>
                  <Text style={styles.poreVal}>{topo.poreAnalysis.averageDepthMm} mm</Text>
                  <Text style={styles.poreKey}>Mean Pore Depth</Text>
                </View>
                <View style={styles.poreGridItem}>
                  <Text style={styles.poreVal}>{topo.poreAnalysis.congestionScore}/10</Text>
                  <Text style={styles.poreKey}>Congestion Index</Text>
                </View>
                <View style={styles.poreGridItem}>
                  <Text style={styles.poreVal}>{topo.poreAnalysis.poreCount}</Text>
                  <Text style={styles.poreKey}>Pores Counted</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Tab 2: rPPG Blood Flow Imaging */}
      {activeTab === "perfusion" && (
        <View style={styles.tabContent}>
          <View style={[styles.rppgCard, { borderColor: `${perfColor}40` }]}>
            <View style={styles.rppgHeader}>
              <View>
                <Text style={styles.sectionLabel}>Capillary Perfusion SNR</Text>
                <Text style={[styles.rppgSnrVal, { color: perfColor }]}>
                  {perf.perfusionScore || 8.5} dB
                </Text>
              </View>
              <View style={[styles.inflamBadge, { backgroundColor: `${perfColor}22` }]}>
                <Text style={[styles.inflamText, { color: perfColor }]}>
                  {isInflamed ? "ACTIVE VASCULARIZATION" : "RESOLVED INFLAMMATION"}
                </Text>
              </View>
            </View>

            <View style={styles.pulseRow}>
              <MaterialCommunityIcons name="heart-pulse" size={20} color="#EF4444" />
              <Text style={styles.pulseText}>
                Facial capillary pulse: <Text style={{ color: "#F8FAFC", fontWeight: "700" }}>{perf.peakBpm || 72} BPM</Text>
              </Text>
            </View>

            {perf.subclinicalInflammationDetected && (
              <View style={styles.alertBox}>
                <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#F59E0B" />
                <Text style={styles.alertText}>
                  Sub-clinical inflammation detected beneath epidermis before surface erythema.
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Tab 3: 240fps Elasticity */}
      {activeTab === "elasticity" && (
        <View style={styles.tabContent}>
          <View style={styles.elastCard}>
            <View style={styles.elastHeader}>
              <View>
                <Text style={styles.sectionLabel}>Viscoelastic Recovery Rate</Text>
                <Text style={styles.elastGrade}>
                  {elast.overallGrade?.toUpperCase()} ELASTICITY
                </Text>
              </View>
              <View style={styles.firmnessBadge}>
                <Text style={styles.firmnessScore}>{elast.firmnessScore || 8.7}/10</Text>
                <Text style={styles.firmnessKey}>Firmness</Text>
              </View>
            </View>

            <View style={styles.tauRow}>
              <MaterialCommunityIcons name="timer-sand" size={18} color="#10B981" />
              <Text style={styles.tauText}>
                Snapback recovery tau constant: <Text style={{ color: "#F8FAFC", fontWeight: "700" }}>{elast.recoveryTimeMs || 259} ms</Text>
              </Text>
            </View>

            <Text style={styles.elastExpl}>
              Exponential snapback decay: y(t) = A·e^(-t/τ). Rapid recovery (&lt;300ms) correlates with resilient dermal collagen and intact elastin fibers.
            </Text>
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
    borderColor: "rgba(6, 182, 212, 0.25)",
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
  pillBadge: {
    backgroundColor: "rgba(6, 182, 212, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pillText: {
    color: "#06B6D4",
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
    backgroundColor: "rgba(6, 182, 212, 0.2)",
  },
  tabText: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "700",
  },
  tabTextActive: {
    color: "#06B6D4",
  },
  tabContent: {
    marginTop: 4,
  },
  sectionLabel: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  topoCard: {
    backgroundColor: "#0B0F17",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  topoMainRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  topoClassification: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  topoDetail: {
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 2,
  },
  topoIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  gaugeContainer: {
    marginTop: 4,
  },
  gaugeLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  gaugeText: {
    color: "#64748B",
    fontSize: 9,
  },
  gaugeTrack: {
    height: 6,
    backgroundColor: "#1E293B",
    borderRadius: 3,
    position: "relative",
  },
  gaugeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: "absolute",
    top: -3,
    marginLeft: -6,
  },
  poreCard: {
    backgroundColor: "#0B0F17",
    borderRadius: 12,
    padding: 12,
  },
  poreGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  poreGridItem: {
    alignItems: "center",
    flex: 1,
  },
  poreVal: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "800",
  },
  poreKey: {
    color: "#64748B",
    fontSize: 10,
    marginTop: 2,
  },
  rppgCard: {
    backgroundColor: "#0B0F17",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  rppgHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  rppgSnrVal: {
    fontSize: 22,
    fontWeight: "800",
  },
  inflamBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  inflamText: {
    fontSize: 10,
    fontWeight: "800",
  },
  pulseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
  },
  pulseText: {
    color: "#94A3B8",
    fontSize: 12,
  },
  alertBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    padding: 8,
    borderRadius: 8,
    gap: 6,
    marginTop: 6,
  },
  alertText: {
    color: "#F59E0B",
    fontSize: 11,
    flex: 1,
  },
  elastCard: {
    backgroundColor: "#0B0F17",
    borderRadius: 12,
    padding: 12,
  },
  elastHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  elastGrade: {
    color: "#10B981",
    fontSize: 16,
    fontWeight: "800",
  },
  firmnessBadge: {
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  firmnessScore: {
    color: "#10B981",
    fontSize: 14,
    fontWeight: "800",
  },
  firmnessKey: {
    color: "#6EE7B7",
    fontSize: 9,
    fontWeight: "600",
  },
  tauRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
  },
  tauText: {
    color: "#94A3B8",
    fontSize: 12,
  },
  elastExpl: {
    color: "#64748B",
    fontSize: 10,
    lineHeight: 14,
    marginTop: 6,
  },
});
