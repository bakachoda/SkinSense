import React, { useState } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Switch, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { AdvancedCaptureMode } from "@skinsense/types";

interface AdvancedCaptureModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectMode: (mode: AdvancedCaptureMode, options: { useRawDng: boolean; wifiOnly: boolean }) => void;
}

export function AdvancedCaptureModal({
  visible,
  onClose,
  onSelectMode,
}: AdvancedCaptureModalProps) {
  const [selectedMode, setSelectedMode] = useState<AdvancedCaptureMode>("lidar");
  const [useRawDng, setUseRawDng] = useState(true);
  const [wifiOnly, setWifiOnly] = useState(true);
  const [isSimulatingCapture, setIsSimulatingCapture] = useState(false);
  const [simulatedFeedback, setSimulatedFeedback] = useState<string | null>(null);

  const handleStartCapture = () => {
    setIsSimulatingCapture(true);
    setSimulatedFeedback("Calibrating optical sensors & preparing camera session...");

    setTimeout(() => {
      if (selectedMode === "multispectral") {
        setSimulatedFeedback("Screen flashing: 625nm Red -> 530nm Green -> 470nm Blue -> 410nm Violet...");
      } else if (selectedMode === "elasticity_240fps") {
        setSimulatedFeedback("Recording at 240fps: Raise brows -> Smile wide -> Snapback...");
      } else if (selectedMode === "lidar") {
        setSimulatedFeedback("Scanning 16-bit time-of-flight point cloud mesh...");
      } else {
        setSimulatedFeedback("Acquiring 14-bit Bayer RGGB DNG frame...");
      }
    }, 1000);

    setTimeout(() => {
      setIsSimulatingCapture(false);
      setSimulatedFeedback(null);
      onSelectMode(selectedMode, { useRawDng, wifiOnly });
      onClose();
    }, 2200);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Advanced Capture Studio</Text>
              <Text style={styles.subtitle}>
                Hardware-accelerated dermatological capture modes
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={22} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
            {/* Mode 1: 3D LiDAR Topology */}
            <TouchableOpacity
              style={[
                styles.modeCard,
                selectedMode === "lidar" && styles.modeCardSelected,
              ]}
              onPress={() => setSelectedMode("lidar")}
              activeOpacity={0.8}
            >
              <View style={styles.modeIconWrap}>
                <MaterialCommunityIcons name="cube-scan" size={24} color="#06B6D4" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={styles.modeTitleRow}>
                  <Text style={styles.modeTitle}>3D LiDAR & Point Cloud</Text>
                  <View style={[styles.badge, { backgroundColor: "rgba(6, 182, 212, 0.15)" }]}>
                    <Text style={{ color: "#06B6D4", fontSize: 10, fontWeight: "700" }}>0.5mm Depth</Text>
                  </View>
                </View>
                <Text style={styles.modeDesc}>
                  Reconstructs 3D facial topology to distinguish raised papules from atrophic ice-pick scars and measure pore depth.
                </Text>
              </View>
            </TouchableOpacity>

            {/* Mode 2: Multispectral Screen Flash */}
            <TouchableOpacity
              style={[
                styles.modeCard,
                selectedMode === "multispectral" && styles.modeCardSelected,
              ]}
              onPress={() => setSelectedMode("multispectral")}
              activeOpacity={0.8}
            >
              <View style={[styles.modeIconWrap, { backgroundColor: "rgba(168, 85, 247, 0.15)" }]}>
                <MaterialCommunityIcons name="palette-swatch-outline" size={24} color="#A855F7" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={styles.modeTitleRow}>
                  <Text style={styles.modeTitle}>4-Color Multispectral</Text>
                  <View style={[styles.badge, { backgroundColor: "rgba(168, 85, 247, 0.15)" }]}>
                    <Text style={{ color: "#A855F7", fontSize: 10, fontWeight: "700" }}>P. Acnes & Sebum</Text>
                  </View>
                </View>
                <Text style={styles.modeDesc}>
                  Flashes Red (625nm), Green (530nm), Blue (470nm), and Violet (410nm) to measure porphyrin bacteria fluorescence and LCD polarization.
                </Text>
              </View>
            </TouchableOpacity>

            {/* Mode 3: 240fps High-Speed Elasticity */}
            <TouchableOpacity
              style={[
                styles.modeCard,
                selectedMode === "elasticity_240fps" && styles.modeCardSelected,
              ]}
              onPress={() => setSelectedMode("elasticity_240fps")}
              activeOpacity={0.8}
            >
              <View style={[styles.modeIconWrap, { backgroundColor: "rgba(16, 185, 129, 0.15)" }]}>
                <MaterialCommunityIcons name="speedometer" size={24} color="#10B981" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={styles.modeTitleRow}>
                  <Text style={styles.modeTitle}>240fps Viscoelasticity</Text>
                  <View style={[styles.badge, { backgroundColor: "rgba(16, 185, 129, 0.15)" }]}>
                    <Text style={{ color: "#10B981", fontSize: 10, fontWeight: "700" }}>Collagen Tau</Text>
                  </View>
                </View>
                <Text style={styles.modeDesc}>
                  High-speed video captures facial snapback velocity after expression, computing exponential decay recovery rate (τ in ms).
                </Text>
              </View>
            </TouchableOpacity>

            {/* Mode 4: 14-bit Uncompressed RAW */}
            <TouchableOpacity
              style={[
                styles.modeCard,
                selectedMode === "raw" && styles.modeCardSelected,
              ]}
              onPress={() => setSelectedMode("raw")}
              activeOpacity={0.8}
            >
              <View style={[styles.modeIconWrap, { backgroundColor: "rgba(245, 158, 11, 0.15)" }]}>
                <MaterialCommunityIcons name="camera-iris" size={24} color="#F59E0B" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={styles.modeTitleRow}>
                  <Text style={styles.modeTitle}>Lossless 14-bit RAW (DNG)</Text>
                  <View style={[styles.badge, { backgroundColor: "rgba(245, 158, 11, 0.15)" }]}>
                    <Text style={{ color: "#F59E0B", fontSize: 10, fontWeight: "700" }}>No Compression</Text>
                  </View>
                </View>
                <Text style={styles.modeDesc}>
                  Bypasses OEM smoothing algorithms and noise filters, preserving micro-textures and subtle vascular erythema variations.
                </Text>
              </View>
            </TouchableOpacity>

            {/* Upload Options */}
            <View style={styles.togglesBox}>
              <View style={styles.toggleRow}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles.toggleLabel}>Lossless RAW Archival (25-50 MB)</Text>
                  <Text style={styles.toggleSub}>Uploads unprocessed sensor data for clinical accuracy</Text>
                </View>
                <Switch
                  value={useRawDng}
                  onValueChange={setUseRawDng}
                  trackColor={{ false: "#1E293B", true: "#06B6D4" }}
                />
              </View>

              <View style={[styles.toggleRow, { marginTop: 10, borderTopWidth: 1, borderTopColor: "rgba(255, 255, 255, 0.05)", paddingTop: 10 }]}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles.toggleLabel}>Wi-Fi Background Upload Only</Text>
                  <Text style={styles.toggleSub}>Prevents cellular mobile data consumption for large scans</Text>
                </View>
                <Switch
                  value={wifiOnly}
                  onValueChange={setWifiOnly}
                  trackColor={{ false: "#1E293B", true: "#10B981" }}
                />
              </View>
            </View>

            {/* Simulation feedback indicator */}
            {isSimulatingCapture && (
              <View style={styles.simulationBanner}>
                <ActivityIndicator size="small" color="#06B6D4" />
                <Text style={styles.simulationText}>{simulatedFeedback}</Text>
              </View>
            )}

            {/* Action Button */}
            <TouchableOpacity
              style={styles.startBtn}
              onPress={handleStartCapture}
              disabled={isSimulatingCapture}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="camera-enhance" size={20} color="#0B0F17" />
              <Text style={styles.startBtnText}>
                {isSimulatingCapture ? "Calibrating..." : "Start Advanced Scan Session"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#131B2E",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.3)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  title: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "800",
  },
  subtitle: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  modeCard: {
    flexDirection: "row",
    backgroundColor: "#0B0F17",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  modeCardSelected: {
    borderColor: "#06B6D4",
    backgroundColor: "rgba(6, 182, 212, 0.08)",
  },
  modeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(6, 182, 212, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  modeTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  modeTitle: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "700",
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  modeDesc: {
    color: "#94A3B8",
    fontSize: 11,
    lineHeight: 15,
  },
  togglesBox: {
    backgroundColor: "#0B0F17",
    borderRadius: 14,
    padding: 14,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleLabel: {
    color: "#F8FAFC",
    fontSize: 12,
    fontWeight: "700",
  },
  toggleSub: {
    color: "#64748B",
    fontSize: 10,
    marginTop: 2,
  },
  simulationBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    padding: 10,
    borderRadius: 10,
    gap: 8,
    marginBottom: 10,
  },
  simulationText: {
    color: "#06B6D4",
    fontSize: 11,
    fontWeight: "600",
    flex: 1,
  },
  startBtn: {
    backgroundColor: "#06B6D4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginTop: 6,
    marginBottom: 12,
  },
  startBtnText: {
    color: "#0B0F17",
    fontSize: 15,
    fontWeight: "800",
  },
});
