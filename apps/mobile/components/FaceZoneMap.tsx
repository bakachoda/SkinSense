import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import Svg, { Path, Ellipse, G } from "react-native-svg";
import type { ZoneScore } from "@skinsense/types";
import { X } from "lucide-react-native";

interface Props {
  zoneScores: Record<string, ZoneScore | Record<string, number>>;
  onSelectZone?: (zoneName: string) => void;
}

const ZONE_LABELS: Record<string, string> = {
  forehead: "Forehead",
  nose: "Nose",
  left_cheek: "Left Cheek",
  right_cheek: "Right Cheek",
  chin: "Chin",
  periorbital: "Periorbital (Under Eyes)",
};

function getZoneWorstScore(zoneData?: ZoneScore | Record<string, number>): number {
  if (!zoneData) return 0;
  const values = Object.values(zoneData).filter((v): v is number => typeof v === "number");
  return values.length > 0 ? Math.max(...values) : 0;
}

function getSeverityColor(score: number): string {
  if (score <= 25) return "#10B981"; // Emerald Green
  if (score <= 50) return "#F59E0B"; // Amber Yellow
  if (score <= 75) return "#F97316"; // Orange
  return "#EF4444"; // Coral Red
}

export function FaceZoneMap({ zoneScores }: Props) {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const foreheadScore = getZoneWorstScore(zoneScores["forehead"]);
  const noseScore = getZoneWorstScore(zoneScores["nose"]);
  const leftCheekScore = getZoneWorstScore(zoneScores["left_cheek"]);
  const rightCheekScore = getZoneWorstScore(zoneScores["right_cheek"]);
  const chinScore = getZoneWorstScore(zoneScores["chin"]);
  const periorbitalScore = getZoneWorstScore(zoneScores["periorbital"]);

  const activeZoneData = selectedZone ? (zoneScores[selectedZone] as Record<string, number> | undefined) : null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Face Zone Analysis</Text>
      <Text style={styles.sectionSub}>Tap any facial zone to inspect localized concern scores</Text>

      {/* Interactive Face Map SVG */}
      <View style={styles.svgWrapper}>
        <View style={{ width: 260, height: 320, position: "relative" }}>
          <Svg width="260" height="320" viewBox="0 0 260 320">
            {/* Base Face Contour */}
            <Path
              d="M 50,90 C 40,160 50,260 130,300 C 210,260 220,160 210,90 C 205,30 55,30 50,90 Z"
              fill="#1E293B"
              stroke="#334155"
              strokeWidth="3"
            />

            {/* Forehead Zone */}
            <G>
              <Path
                d="M 65,70 C 90,45 170,45 195,70 C 185,115 75,115 65,70 Z"
                fill={getSeverityColor(foreheadScore)}
                opacity="0.75"
                stroke="#FFFFFF"
                strokeWidth={selectedZone === "forehead" ? "2.5" : "1"}
              />
            </G>

            {/* Periorbital (Under Eyes) Zone */}
            <G>
              {/* Left Eye Area */}
              <Ellipse
                cx="95"
                cy="125"
                rx="24"
                ry="14"
                fill={getSeverityColor(periorbitalScore)}
                opacity="0.8"
                stroke="#FFFFFF"
                strokeWidth={selectedZone === "periorbital" ? "2.5" : "1"}
              />
              {/* Right Eye Area */}
              <Ellipse
                cx="165"
                cy="125"
                rx="24"
                ry="14"
                fill={getSeverityColor(periorbitalScore)}
                opacity="0.8"
                stroke="#FFFFFF"
                strokeWidth={selectedZone === "periorbital" ? "2.5" : "1"}
              />
            </G>

            {/* Nose Zone */}
            <G>
              <Path
                d="M 120,128 L 140,128 L 145,195 C 138,202 122,202 115,195 Z"
                fill={getSeverityColor(noseScore)}
                opacity="0.85"
                stroke="#FFFFFF"
                strokeWidth={selectedZone === "nose" ? "2.5" : "1"}
              />
            </G>

            {/* Left Cheek Zone */}
            <G>
              <Path
                d="M 60,140 C 70,140 108,150 110,210 C 75,230 55,190 60,140 Z"
                fill={getSeverityColor(leftCheekScore)}
                opacity="0.75"
                stroke="#FFFFFF"
                strokeWidth={selectedZone === "left_cheek" ? "2.5" : "1"}
              />
            </G>

            {/* Right Cheek Zone */}
            <G>
              <Path
                d="M 200,140 C 190,140 152,150 150,210 C 185,230 205,190 200,140 Z"
                fill={getSeverityColor(rightCheekScore)}
                opacity="0.75"
                stroke="#FFFFFF"
                strokeWidth={selectedZone === "right_cheek" ? "2.5" : "1"}
              />
            </G>

            {/* Chin Zone */}
            <G>
              <Path
                d="M 100,230 C 130,225 130,225 160,230 C 160,270 100,270 100,230 Z"
                fill={getSeverityColor(chinScore)}
                opacity="0.8"
                stroke="#FFFFFF"
                strokeWidth={selectedZone === "chin" ? "2.5" : "1"}
              />
            </G>
          </Svg>

          {/* Interactive Touch Overlay Zones */}
          <TouchableOpacity
            style={{ position: "absolute", top: 45, left: 65, width: 130, height: 60 }}
            onPress={() => setSelectedZone("forehead")}
            activeOpacity={0.7}
          />
          <TouchableOpacity
            style={{ position: "absolute", top: 110, left: 70, width: 120, height: 35 }}
            onPress={() => setSelectedZone("periorbital")}
            activeOpacity={0.7}
          />
          <TouchableOpacity
            style={{ position: "absolute", top: 128, left: 115, width: 30, height: 70 }}
            onPress={() => setSelectedZone("nose")}
            activeOpacity={0.7}
          />
          <TouchableOpacity
            style={{ position: "absolute", top: 140, left: 55, width: 55, height: 70 }}
            onPress={() => setSelectedZone("left_cheek")}
            activeOpacity={0.7}
          />
          <TouchableOpacity
            style={{ position: "absolute", top: 140, left: 150, width: 55, height: 70 }}
            onPress={() => setSelectedZone("right_cheek")}
            activeOpacity={0.7}
          />
          <TouchableOpacity
            style={{ position: "absolute", top: 225, left: 100, width: 60, height: 50 }}
            onPress={() => setSelectedZone("chin")}
            activeOpacity={0.7}
          />
        </View>
      </View>

      {/* Severity Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#10B981" }]} />
          <Text style={styles.legendText}>0-25 Good</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#F59E0B" }]} />
          <Text style={styles.legendText}>26-50 Mild</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#F97316" }]} />
          <Text style={styles.legendText}>51-75 Mod</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#EF4444" }]} />
          <Text style={styles.legendText}>76-100 High</Text>
        </View>
      </View>

      {/* Zone Detail Modal / Bottom Sheet */}
      <Modal visible={!!selectedZone} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedZone ? ZONE_LABELS[selectedZone] : ""} Breakdown
              </Text>
              <TouchableOpacity onPress={() => setSelectedZone(null)}>
                <X size={22} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {activeZoneData && (
              <View style={styles.scoresList}>
                {Object.entries(activeZoneData).map(([concern, score]) => {
                  const numScore = typeof score === "number" ? score : 0;
                  return (
                    <View key={concern} style={styles.scoreRow}>
                      <Text style={styles.scoreConcern}>
                        {concern.replace("_", " ").toUpperCase()}
                      </Text>
                      <View style={styles.barContainer}>
                        <View
                          style={[
                            styles.scoreBar,
                            {
                              width: `${Math.min(100, Math.max(0, numScore))}%`,
                              backgroundColor: getSeverityColor(numScore),
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.scoreNumber}>{numScore}/100</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#161E2E",
    borderRadius: 16,
    padding: 20,
    marginVertical: 14,
    borderWidth: 1,
    borderColor: "#1F2937",
    alignItems: "center",
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F9FAFB",
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 13,
    color: "#9CA3AF",
    marginBottom: 16,
    textAlign: "center",
  },
  svgWrapper: {
    marginVertical: 8,
    alignItems: "center",
  },
  legendRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    color: "#9CA3AF",
    fontSize: 11,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#111827",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "#374151",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#F9FAFB",
  },
  scoresList: {
    gap: 14,
    paddingBottom: 20,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  scoreConcern: {
    width: 100,
    fontSize: 13,
    fontWeight: "600",
    color: "#D1D5DB",
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: "#1F2937",
    borderRadius: 4,
    overflow: "hidden",
  },
  scoreBar: {
    height: "100%",
    borderRadius: 4,
  },
  scoreNumber: {
    width: 50,
    textAlign: "right",
    fontSize: 13,
    fontWeight: "600",
    color: "#F3F4F6",
  },
});
