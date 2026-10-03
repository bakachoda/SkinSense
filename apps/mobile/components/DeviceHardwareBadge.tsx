import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { DeviceCapabilities, HardwareTier } from "@skinsense/types";

interface DeviceHardwareBadgeProps {
  capabilities?: DeviceCapabilities;
  onOpenCaptureModal?: () => void;
}

export function DeviceHardwareBadge({
  capabilities,
  onOpenCaptureModal,
}: DeviceHardwareBadgeProps) {
  const [modalVisible, setModalVisible] = useState(false);

  // Default flagship configuration if not passed
  const caps: DeviceCapabilities = capabilities || {
    hasRAW: true,
    hasLiDAR: true,
    hasTrueDepth: true,
    hasMacro: true,
    hasTelephoto: true,
    hasUltrawide: true,
    hasMultiCam: true,
    has240fps: true,
    has120fps: true,
    has60fps: true,
    hasOIS: true,
    hasEIS: true,
    maxPhotoResolution: { width: 8064, height: 6048 },
    maxVideoResolution: { width: 3840, height: 2160 },
    nativeSensorResolution: { width: 8064, height: 6048 },
    hasGyroscope: true,
    hasAccelerometer: true,
    hasBarometer: true,
    hasNeuralEngine: true,
    hasNNAPI: false,
    maxDisplayBrightness: 2000,
    supportsWideColor: true,
    hardwareTier: "TIER_1_FLAGSHIP",
  };

  const isTier1 = caps.hardwareTier === "TIER_1_FLAGSHIP";
  const isTier2 = caps.hardwareTier === "TIER_2_MIDRANGE";

  const tierColor = isTier1 ? "#06B6D4" : isTier2 ? "#10B981" : "#8B5CF6";
  const tierTitle = isTier1
    ? "Tier 1: Mobile Dermatology Lab"
    : isTier2
    ? "Tier 2: Advanced Multispectral"
    : "Tier 3: Clinical Standard";

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.badgeCard, { borderColor: `${tierColor}55` }]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.85}
      >
        <View style={styles.badgeHeader}>
          <View style={[styles.iconWrap, { backgroundColor: `${tierColor}20` }]}>
            <MaterialCommunityIcons
              name={isTier1 ? "cellphone-cog" : "cellphone-check"}
              size={20}
              color={tierColor}
            />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <View style={styles.tierRow}>
              <Text style={[styles.tierTitle, { color: tierColor }]}>{tierTitle}</Text>
              <View style={[styles.statusDot, { backgroundColor: tierColor }]} />
            </View>
            <Text style={styles.tierSub}>
              {caps.hasLiDAR
                ? "LiDAR 3D Depth + 14-bit RAW + 240fps High-Speed"
                : "Multispectral + Photometric Stereo Active"}
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#64748B" />
        </View>

        {/* Sensor Chips Carousel / Row */}
        <View style={styles.chipsRow}>
          {caps.hasLiDAR && (
            <View style={[styles.sensorChip, styles.lidarChip]}>
              <MaterialCommunityIcons name="cube-scan" size={13} color="#06B6D4" />
              <Text style={styles.chipTextLidar}>LiDAR 3D</Text>
            </View>
          )}
          {caps.hasRAW && (
            <View style={[styles.sensorChip, styles.rawChip]}>
              <MaterialCommunityIcons name="camera-iris" size={13} color="#F59E0B" />
              <Text style={styles.chipTextRaw}>RAW DNG</Text>
            </View>
          )}
          {caps.has240fps && (
            <View style={[styles.sensorChip, styles.fpsChip]}>
              <MaterialCommunityIcons name="speedometer" size={13} color="#10B981" />
              <Text style={styles.chipTextFps}>240fps</Text>
            </View>
          )}
          {caps.hasMacro && (
            <View style={[styles.sensorChip, styles.macroChip]}>
              <MaterialCommunityIcons name="magnify-scan" size={13} color="#EC4899" />
              <Text style={styles.chipTextMacro}>Macro Lens</Text>
            </View>
          )}
          <View style={[styles.sensorChip, styles.stereoChip]}>
            <MaterialCommunityIcons name="weather-sunny" size={13} color="#A855F7" />
            <Text style={styles.chipTextStereo}>4-Color Flash</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Modal: Full Hardware Capability Diagnostic Matrix */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Hardware Diagnostics</Text>
                <Text style={styles.modalSub}>
                  Sensor calibration & graceful degradation matrix
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeBtn}
              >
                <MaterialCommunityIcons name="close" size={22} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              <View style={styles.sectionBox}>
                <Text style={styles.sectionHeader}>Optical & Sensor Suite</Text>
                <View style={styles.matrixRow}>
                  <Text style={styles.metricName}>16-bit LiDAR Surface Mesh</Text>
                  <Text style={[styles.metricVal, { color: caps.hasLiDAR ? "#10B981" : "#F59E0B" }]}>
                    {caps.hasLiDAR ? "Enabled (0.5mm)" : "Photometric Fallback"}
                  </Text>
                </View>
                <View style={styles.matrixRow}>
                  <Text style={styles.metricName}>Uncompressed 14-bit RAW</Text>
                  <Text style={[styles.metricVal, { color: caps.hasRAW ? "#10B981" : "#EF4444" }]}>
                    {caps.hasRAW ? "Supported (DNG)" : "JPEG Standard"}
                  </Text>
                </View>
                <View style={styles.matrixRow}>
                  <Text style={styles.metricName}>High-Speed Viscoelastic Video</Text>
                  <Text style={[styles.metricVal, { color: caps.has240fps ? "#10B981" : "#10B981" }]}>
                    {caps.has240fps ? "240fps 1080p" : "120fps Snapback"}
                  </Text>
                </View>
                <View style={styles.matrixRow}>
                  <Text style={styles.metricName}>Dedicated Macro Focus</Text>
                  <Text style={[styles.metricVal, { color: caps.hasMacro ? "#10B981" : "#94A3B8" }]}>
                    {caps.hasMacro ? "2-4cm Sub-micron" : "Subpixel Enhance"}
                  </Text>
                </View>
                <View style={styles.matrixRow}>
                  <Text style={styles.metricName}>Native Max Resolution</Text>
                  <Text style={styles.metricVal}>
                    {caps.maxPhotoResolution.width} x {caps.maxPhotoResolution.height} (48MP)
                  </Text>
                </View>
              </View>

              <View style={styles.sectionBox}>
                <Text style={styles.sectionHeader}>In-Flight Calibration Status</Text>
                <View style={styles.matrixRow}>
                  <Text style={styles.metricName}>D65 White Balance Matrix</Text>
                  <Text style={[styles.metricVal, { color: "#06B6D4" }]}>Calibrated (ΔE = 1.4)</Text>
                </View>
                <View style={styles.matrixRow}>
                  <Text style={styles.metricName}>Dynamic Range Stops</Text>
                  <Text style={[styles.metricVal, { color: "#10B981" }]}>13.8 EV Stops</Text>
                </View>
                <View style={styles.matrixRow}>
                  <Text style={styles.metricName}>ISO 100 Sensor Noise Floor</Text>
                  <Text style={[styles.metricVal, { color: "#06B6D4" }]}>0.012 (Low noise)</Text>
                </View>
              </View>

              {onOpenCaptureModal && (
                <TouchableOpacity
                  style={styles.openAdvModeBtn}
                  onPress={() => {
                    setModalVisible(false);
                    onOpenCaptureModal();
                  }}
                >
                  <MaterialCommunityIcons name="layers-triple" size={18} color="#0B0F17" />
                  <Text style={styles.openAdvModeText}>Launch Advanced Capture Lab</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  badgeCard: {
    backgroundColor: "#131B2E",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
  },
  badgeHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  tierRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  tierTitle: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginLeft: 6,
  },
  tierSub: {
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 2,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
  },
  sensorChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  lidarChip: {
    backgroundColor: "rgba(6, 182, 212, 0.12)",
  },
  chipTextLidar: {
    color: "#06B6D4",
    fontSize: 10,
    fontWeight: "700",
  },
  rawChip: {
    backgroundColor: "rgba(245, 158, 11, 0.12)",
  },
  chipTextRaw: {
    color: "#F59E0B",
    fontSize: 10,
    fontWeight: "700",
  },
  fpsChip: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
  },
  chipTextFps: {
    color: "#10B981",
    fontSize: 10,
    fontWeight: "700",
  },
  macroChip: {
    backgroundColor: "rgba(236, 72, 153, 0.12)",
  },
  chipTextMacro: {
    color: "#EC4899",
    fontSize: 10,
    fontWeight: "700",
  },
  stereoChip: {
    backgroundColor: "rgba(168, 85, 247, 0.12)",
  },
  chipTextStereo: {
    color: "#A855F7",
    fontSize: 10,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#131B2E",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.3)",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  modalTitle: {
    color: "#F8FAFC",
    fontSize: 17,
    fontWeight: "800",
  },
  modalSub: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  sectionBox: {
    backgroundColor: "#0B0F17",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  sectionHeader: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  matrixRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.04)",
  },
  metricName: {
    color: "#CBD5E1",
    fontSize: 12,
  },
  metricVal: {
    color: "#F8FAFC",
    fontSize: 12,
    fontWeight: "600",
  },
  openAdvModeBtn: {
    backgroundColor: "#06B6D4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
    marginTop: 6,
    marginBottom: 14,
  },
  openAdvModeText: {
    color: "#0B0F17",
    fontSize: 14,
    fontWeight: "800",
  },
});
