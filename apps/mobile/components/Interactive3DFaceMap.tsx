import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import Svg, {
  Path,
  Ellipse,
  Circle,
  G,
  Defs,
  RadialGradient,
  Stop,
  Line,
} from "react-native-svg";
import {
  Sparkles,
  Layers,
  ChevronRight,
  Clock,
  FlaskConical,
  X,
  AlertCircle,
  TrendingDown,
  Info,
} from "lucide-react-native";
import type { FaceMapLayerType, InteractiveFinding } from "@skinsense/types";

interface Interactive3DFaceMapProps {
  findings?: InteractiveFinding[];
  onSelectFinding?: (finding: InteractiveFinding) => void;
  zoneScores?: Record<string, Record<string, number>>;
}

const DEFAULT_FINDINGS: InteractiveFinding[] = [
  {
    id: "f-1",
    zone: "forehead",
    findingType: "comedones",
    name: "Closed Comedones & Sebum",
    severity: 65,
    rootCause: "Hyperkeratinization combined with follicular lipid excess.",
    activeIngredients: ["Salicylic Acid 2%", "Niacinamide 10%"],
    expectedTimelineWeeks: 4,
    trendSparkline: [80, 78, 74, 70, 68, 65],
  },
  {
    id: "f-2",
    zone: "left_cheek",
    findingType: "erythema",
    name: "Microvascular Erythema",
    severity: 55,
    rootCause: "Superficial capillary dilation with impaired barrier moisture retention.",
    activeIngredients: ["Azelaic Acid 10%", "Centella Asiatica Extract"],
    expectedTimelineWeeks: 6,
    trendSparkline: [72, 68, 65, 60, 58, 55],
  },
  {
    id: "f-3",
    zone: "nose",
    findingType: "roughness",
    name: "Follicular Texture & Congestion",
    severity: 52,
    rootCause: "Oxidized sebaceous filaments in dilated follicular infundibula.",
    activeIngredients: ["BHA (Salicylic Acid)", "Zinc PCA"],
    expectedTimelineWeeks: 3,
    trendSparkline: [62, 60, 58, 56, 54, 52],
  },
  {
    id: "f-4",
    zone: "right_cheek",
    findingType: "hyperpigmentation",
    name: "Post-Inflammatory Hyperpigmentation",
    severity: 38,
    rootCause: "Melanocyte hyperactivity following previous acne flare.",
    activeIngredients: ["Alpha Arbutin 2%", "Ascorbic Acid 8%"],
    expectedTimelineWeeks: 8,
    trendSparkline: [50, 48, 44, 42, 40, 38],
  },
  {
    id: "f-5",
    zone: "periorbital",
    findingType: "dehydration",
    name: "Orbital Dehydration Lines",
    severity: 42,
    rootCause: "Thin periorbital stratum corneum moisture evaporation.",
    activeIngredients: ["Multi-Molecular Hyaluronic Acid", "Ceramide NP"],
    expectedTimelineWeeks: 2,
    trendSparkline: [65, 58, 52, 48, 45, 42],
  },
  {
    id: "f-6",
    zone: "chin",
    findingType: "comedones",
    name: "Submental Micro-Comedones",
    severity: 44,
    rootCause: "Hormonal sebum fluctuation around mental crease.",
    activeIngredients: ["Retinoid 0.2%", "Zinc PCA"],
    expectedTimelineWeeks: 6,
    trendSparkline: [58, 54, 50, 48, 46, 44],
  },
];

const LAYERS: { id: FaceMapLayerType; label: string; color: string }[] = [
  { id: "all", label: "All Concerns", color: "#111827" },
  { id: "oiliness", label: "Sebum", color: "#D97706" },
  { id: "erythema", label: "Redness", color: "#EF4444" },
  { id: "texture", label: "Texture", color: "#06B6D4" },
  { id: "uv", label: "Pigment", color: "#8B5CF6" },
  { id: "surface", label: "3D Mesh", color: "#64748B" },
];

function getPinSeverityColor(severity: number): string {
  if (severity <= 35) return "#10B981"; // Emerald
  if (severity <= 55) return "#F59E0B"; // Amber
  if (severity <= 75) return "#F97316"; // Orange
  return "#EF4444"; // Red
}

export function Interactive3DFaceMap({
  findings = DEFAULT_FINDINGS,
  onSelectFinding,
}: Interactive3DFaceMapProps) {
  const [activeLayer, setActiveLayer] = useState<FaceMapLayerType>("all");
  const [selectedFinding, setSelectedFinding] = useState<InteractiveFinding | null>(null);

  const filteredFindings = findings.filter((f) => {
    if (activeLayer === "all" || activeLayer === "surface") return true;
    if (activeLayer === "oiliness") return f.findingType === "comedones" || f.zone === "forehead";
    if (activeLayer === "erythema") return f.findingType === "erythema";
    if (activeLayer === "texture") return f.findingType === "roughness";
    if (activeLayer === "uv") return f.findingType === "hyperpigmentation";
    return true;
  });

  const handleTapFinding = (f: InteractiveFinding) => {
    setSelectedFinding(f);
    if (onSelectFinding) onSelectFinding(f);
  };

  return (
    <View style={styles.card}>
      {/* Title & Legend Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Layers size={18} color="#111827" />
          <Text style={styles.title}>Interactive 3D Face Map</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>6 Zones Tracked</Text>
        </View>
      </View>

      <Text style={styles.subtitle}>
        Tap any finding marker on the facial geometry to inspect root causes and targeted actives.
      </Text>

      {/* Layer Selector Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.layerBar}
      >
        {LAYERS.map((layer) => {
          const isSelected = activeLayer === layer.id;
          return (
            <TouchableOpacity
              key={layer.id}
              style={[
                styles.layerChip,
                isSelected && { backgroundColor: layer.color, borderColor: layer.color },
              ]}
              onPress={() => setActiveLayer(layer.id)}
            >
              <Text
                style={[
                  styles.layerChipText,
                  isSelected && { color: "#FFFFFF", fontWeight: "700" },
                ]}
              >
                {layer.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Interactive 3D Mesh & Finding Pins */}
      <View style={styles.canvasContainer}>
        <Svg width="280" height="340" viewBox="0 0 280 340">
          <Defs>
            <RadialGradient id="meshGlow" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%" stopColor="#F8FAFC" stopOpacity="1" />
              <Stop offset="100%" stopColor="#EDF2F7" stopOpacity="1" />
            </RadialGradient>
            <RadialGradient id="sebumHeatmap" cx="50%" cy="30%" rx="40%" ry="30%">
              <Stop offset="0%" stopColor="#FBBF24" stopOpacity="0.45" />
              <Stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id="erythemaHeatmap" cx="30%" cy="55%" rx="30%" ry="25%">
              <Stop offset="0%" stopColor="#EF4444" stopOpacity="0.4" />
              <Stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id="textureHeatmap" cx="50%" cy="50%" rx="20%" ry="20%">
              <Stop offset="0%" stopColor="#06B6D4" stopOpacity="0.35" />
              <Stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
            </RadialGradient>
          </Defs>

          {/* Canonical 3D Head Silhouette */}
          <Path
            d="M 55,95 C 45,170 55,275 140,315 C 225,275 235,170 225,95 C 220,35 60,35 55,95 Z"
            fill="url(#meshGlow)"
            stroke="#CBD5E1"
            strokeWidth="1.5"
          />

          {/* 3D Wireframe Depth Latitudes */}
          <Path
            d="M 58,110 Q 140,140 222,110"
            stroke="#E2E8F0"
            strokeWidth="1"
            fill="none"
          />
          <Path
            d="M 64,170 Q 140,210 216,170"
            stroke="#E2E8F0"
            strokeWidth="1"
            fill="none"
          />
          <Path
            d="M 85,230 Q 140,265 195,230"
            stroke="#E2E8F0"
            strokeWidth="1"
            fill="none"
          />
          {/* Central Sagittal Meridian */}
          <Line x1="140" y1="40" x2="140" y2="315" stroke="#E2E8F0" strokeWidth="1" />

          {/* Layer Specific Heatmap Overlays */}
          {(activeLayer === "all" || activeLayer === "oiliness") && (
            <Ellipse cx="140" cy="95" rx="65" ry="35" fill="url(#sebumHeatmap)" />
          )}

          {(activeLayer === "all" || activeLayer === "erythema") && (
            <>
              <Ellipse cx="90" cy="180" rx="35" ry="28" fill="url(#erythemaHeatmap)" />
              <Ellipse cx="190" cy="180" rx="35" ry="28" fill="url(#erythemaHeatmap)" />
            </>
          )}

          {(activeLayer === "all" || activeLayer === "texture") && (
            <Ellipse cx="140" cy="165" rx="22" ry="25" fill="url(#textureHeatmap)" />
          )}

          {/* Anatomical Landmark Outlines */}
          {/* Eyes */}
          <Ellipse cx="100" cy="130" rx="20" ry="10" stroke="#94A3B8" strokeWidth="1" fill="#FFFFFF" opacity="0.6" />
          <Ellipse cx="180" cy="130" rx="20" ry="10" stroke="#94A3B8" strokeWidth="1" fill="#FFFFFF" opacity="0.6" />
          {/* Nose Bridge & Tip */}
          <Path d="M 140,120 L 136,175 Q 140,185 144,175 Z" stroke="#94A3B8" strokeWidth="1" fill="none" />
          {/* Lips */}
          <Path d="M 115,245 Q 140,240 165,245 Q 140,260 115,245 Z" stroke="#94A3B8" strokeWidth="1" fill="#FFFFFF" opacity="0.6" />

          {/* Interactive Finding Pins */}
          {filteredFindings.map((finding) => {
            let cx = 140;
            let cy = 100;
            if (finding.zone === "forehead") {
              cx = 140;
              cy = 85;
            } else if (finding.zone === "left_cheek") {
              cx = 88;
              cy = 185;
            } else if (finding.zone === "right_cheek") {
              cx = 192;
              cy = 185;
            } else if (finding.zone === "nose") {
              cx = 140;
              cy = 165;
            } else if (finding.zone === "periorbital") {
              cx = 95;
              cy = 145;
            } else if (finding.zone === "chin") {
              cx = 140;
              cy = 280;
            }

            const pinColor = getPinSeverityColor(finding.severity);

            return (
              <G key={finding.id} onPress={() => handleTapFinding(finding)}>
                {/* Outer Pulse Ring */}
                <Circle cx={cx} cy={cy} r="14" fill={pinColor} opacity="0.25" />
                {/* Mid Glow */}
                <Circle cx={cx} cy={cy} r="8" fill={pinColor} opacity="0.85" />
                {/* Center Core */}
                <Circle cx={cx} cy={cy} r="4" fill="#FFFFFF" />
              </G>
            );
          })}
        </Svg>
      </View>

      {/* Mini Zone Quick Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#10B981" }]} />
          <Text style={styles.legendText}>Optimal (&lt;35)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#F59E0B" }]} />
          <Text style={styles.legendText}>Mild (36-55)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#EF4444" }]} />
          <Text style={styles.legendText}>Active Concern (&gt;55)</Text>
        </View>
      </View>

      {/* Tap-able Zone Findings Quick Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.findingsScroll}
      >
        {filteredFindings.map((finding) => (
          <TouchableOpacity
            key={finding.id}
            style={styles.findingCard}
            onPress={() => setSelectedFinding(finding)}
            activeOpacity={0.8}
          >
            <View style={styles.findingCardTop}>
              <View
                style={[
                  styles.findingCardDot,
                  { backgroundColor: getPinSeverityColor(finding.severity) },
                ]}
              />
              <Text style={styles.findingCardZone}>
                {finding.zone.replace("_", " ").toUpperCase()}
              </Text>
            </View>
            <Text style={styles.findingCardName} numberOfLines={1}>
              {finding.name}
            </Text>
            <Text style={styles.findingCardScore}>
              Score: {finding.severity} • Inspect →
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Finding Detail Modal */}
      <Modal
        visible={!!selectedFinding}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedFinding(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {selectedFinding && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalTitleWrap}>
                    <Text style={styles.modalZone}>
                      {selectedFinding.zone.replace("_", " ").toUpperCase()}
                    </Text>
                    <Text style={styles.modalTitle}>{selectedFinding.name}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setSelectedFinding(null)}
                    style={styles.closeBtn}
                  >
                    <X size={20} color="#64748B" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  {/* Severity Card */}
                  <View style={styles.severityCard}>
                    <View>
                      <Text style={styles.severityLabel}>Severity Score</Text>
                      <Text
                        style={[
                          styles.severityScore,
                          { color: getPinSeverityColor(selectedFinding.severity) },
                        ]}
                      >
                        {selectedFinding.severity}
                        <Text style={styles.severityMax}> / 100</Text>
                      </Text>
                    </View>
                    <View style={styles.timelineBadge}>
                      <Clock size={14} color="#0284C7" />
                      <Text style={styles.timelineText}>
                        ~{selectedFinding.expectedTimelineWeeks} wks to clear
                      </Text>
                    </View>
                  </View>

                  {/* Root Cause Section */}
                  <View style={styles.sectionBlock}>
                    <View style={styles.sectionLabelRow}>
                      <AlertCircle size={15} color="#D97706" />
                      <Text style={styles.sectionLabel}>Clinical Root Cause</Text>
                    </View>
                    <Text style={styles.sectionText}>{selectedFinding.rootCause}</Text>
                  </View>

                  {/* Targeted Active Ingredients */}
                  <View style={styles.sectionBlock}>
                    <View style={styles.sectionLabelRow}>
                      <FlaskConical size={15} color="#0284C7" />
                      <Text style={styles.sectionLabel}>Targeted by Prescribed Actives</Text>
                    </View>
                    <View style={styles.activesWrap}>
                      {selectedFinding.activeIngredients.map((ing, i) => (
                        <View key={i} style={styles.activePill}>
                          <Text style={styles.activePillText}>{ing}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Trend Sparkline History */}
                  <View style={styles.sectionBlock}>
                    <View style={styles.sectionLabelRow}>
                      <TrendingDown size={15} color="#10B981" />
                      <Text style={styles.sectionLabel}>Progress Trajectory (Last 6 Scans)</Text>
                    </View>
                    <View style={styles.sparklineCard}>
                      <View style={styles.sparklineBars}>
                        {selectedFinding.trendSparkline.map((val, idx) => {
                          const heightPct = Math.round((val / 100) * 44);
                          const isLast = idx === selectedFinding.trendSparkline.length - 1;
                          return (
                            <View key={idx} style={styles.barCol}>
                              <View
                                style={[
                                  styles.barFill,
                                  {
                                    height: heightPct,
                                    backgroundColor: isLast ? "#10B981" : "#94A3B8",
                                  },
                                ]}
                              />
                              <Text style={styles.barVal}>{val}</Text>
                            </View>
                          );
                        })}
                      </View>
                      <Text style={styles.sparklineSub}>
                        Trajectory: -15 pts (Consistent Improvement)
                      </Text>
                    </View>
                  </View>
                </ScrollView>

                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => setSelectedFinding(null)}
                >
                  <Text style={styles.actionBtnText}>Done</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  badge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
    marginBottom: 12,
  },
  layerBar: {
    flexDirection: "row",
    gap: 6,
    paddingBottom: 10,
  },
  layerChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  layerChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  canvasContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 12,
  },
  modalTitleWrap: {
    flex: 1,
  },
  modalZone: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0284C7",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.4,
  },
  closeBtn: {
    padding: 4,
  },
  modalBody: {
    marginVertical: 14,
  },
  severityCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  severityLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  severityScore: {
    fontSize: 24,
    fontWeight: "800",
    marginTop: 2,
  },
  severityMax: {
    fontSize: 13,
    color: "#94A3B8",
    fontWeight: "500",
  },
  timelineBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  timelineText: {
    fontSize: 12,
    color: "#0284C7",
    fontWeight: "700",
  },
  sectionBlock: {
    marginBottom: 14,
  },
  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },
  sectionText: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 19,
  },
  activesWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  activePill: {
    backgroundColor: "#F0F9FF",
    borderWidth: 1,
    borderColor: "#BAE6FD",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  activePillText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0369A1",
  },
  sparklineCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  sparklineBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 60,
    paddingTop: 10,
  },
  barCol: {
    alignItems: "center",
    gap: 4,
  },
  barFill: {
    width: 28,
    borderRadius: 4,
  },
  barVal: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "600",
  },
  sparklineSub: {
    fontSize: 11,
    color: "#059669",
    fontWeight: "600",
    textAlign: "center",
    marginTop: 8,
  },
  actionBtn: {
    backgroundColor: "#0F172A",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  findingsScroll: {
    gap: 8,
    paddingVertical: 10,
  },
  findingCard: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    padding: 10,
    width: 140,
  },
  findingCardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 4,
  },
  findingCardDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  findingCardZone: {
    fontSize: 10,
    fontWeight: "700",
    color: "#0284C7",
  },
  findingCardName: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  findingCardScore: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
  },
});
