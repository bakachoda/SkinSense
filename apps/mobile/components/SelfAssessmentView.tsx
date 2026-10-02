import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  Pressable,
} from "react-native";
import {
  Sparkles,
  MapPin,
  Check,
  CheckCircle2,
  Plus,
  Info,
  Layers,
  Send,
} from "lucide-react-native";
import type {
  FaceZoneType,
  SpotMarker,
  UserSelection,
  CreateSelfAssessment,
} from "@skinsense/types";

const { width } = Dimensions.get("window");

interface SelfAssessmentViewProps {
  onComplete: (data: CreateSelfAssessment) => void;
  isSubmitting?: boolean;
}

const ZONES: { key: FaceZoneType; label: string }[] = [
  { key: "forehead", label: "Forehead" },
  { key: "nose", label: "Nose & T-Zone" },
  { key: "left_cheek", label: "Left Cheek" },
  { key: "right_cheek", label: "Right Cheek" },
  { key: "chin", label: "Chin & Jawline" },
  { key: "periorbital", label: "Under-Eye Area" },
];

const CONCERN_CATEGORIES = [
  { id: "active_acne", label: "Active Acne", desc: "Papules, blemishes" },
  { id: "blackheads", label: "Blackheads", desc: "Clogged pores" },
  { id: "redness", label: "Redness / Flush", desc: "Erythema, irritation" },
  { id: "dark_spots", label: "Dark Spots", desc: "Hyperpigmentation" },
  { id: "dryness", label: "Dry Flakes", desc: "Rough, dehydrated skin" },
  { id: "oiliness", label: "Excess Oil", desc: "Greasy sheen" },
  { id: "fine_lines", label: "Fine Lines", desc: "Creases, crow's feet" },
  { id: "pores", label: "Visible Pores", desc: "Enlarged texture" },
];

export function SelfAssessmentView({ onComplete, isSubmitting = false }: SelfAssessmentViewProps) {
  const [activeTab, setActiveTab] = useState<"ZONES" | "TOUCH_MARK">("ZONES");
  const [selectedZone, setSelectedZone] = useState<FaceZoneType>("forehead");

  // Record selections per zone: zone -> concernIds
  const [zoneSelections, setZoneSelections] = useState<Record<FaceZoneType, string[]>>({
    forehead: ["oiliness"],
    nose: ["blackheads"],
    left_cheek: ["active_acne"],
    right_cheek: [],
    chin: [],
    periorbital: ["dark_spots"],
  });

  // Touch markers
  const [spotMarkers, setSpotMarkers] = useState<SpotMarker[]>([
    {
      id: "demo-marker-1",
      x: 0.35,
      y: 0.45,
      zone: "left_cheek",
      userNote: "Persistent bump here",
    },
  ]);
  const [activeNoteText, setActiveNoteText] = useState<string>("");

  const toggleConcern = (concernId: string) => {
    setZoneSelections((prev) => {
      const current = prev[selectedZone] || [];
      const updated = current.includes(concernId)
        ? current.filter((id) => id !== concernId)
        : [...current, concernId];
      return { ...prev, [selectedZone]: updated };
    });
  };

  const handleCanvasTap = (evt: any) => {
    const { locationX, locationY } = evt.nativeEvent;
    const canvasWidth = width - 48;
    const canvasHeight = 280;

    const normX = Math.round((locationX / canvasWidth) * 100) / 100;
    const normY = Math.round((locationY / canvasHeight) * 100) / 100;

    // Approximate zone from Y/X coordinates
    let zone: FaceZoneType = "left_cheek";
    if (normY < 0.32) zone = "forehead";
    else if (normY > 0.72) zone = "chin";
    else if (normX > 0.4 && normX < 0.6) zone = "nose";
    else if (normX >= 0.6) zone = "right_cheek";
    else zone = "left_cheek";

    const newMarker: SpotMarker = {
      id: `spot-${Date.now()}`,
      x: Math.min(0.95, Math.max(0.05, normX)),
      y: Math.min(0.95, Math.max(0.05, normY)),
      zone,
      userNote: activeNoteText.trim() || undefined,
    };

    setSpotMarkers((prev) => [...prev, newMarker]);
    setActiveNoteText("");
  };

  const removeSpotMarker = (id?: string) => {
    setSpotMarkers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSubmit = () => {
    const selections: UserSelection[] = Object.entries(zoneSelections)
      .filter(([_, concerns]) => concerns.length > 0)
      .map(([zone, concerns]) => ({
        zone: zone as FaceZoneType,
        concerns,
      }));

    onComplete({
      selections,
      spotMarkers,
    });
  };

  return (
    <View style={styles.container}>
      {/* Top Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerHeader}>
          <Sparkles size={16} color="#10B981" />
          <Text style={styles.bannerTitle}>Dual Validation (Self-Assessment)</Text>
        </View>
        <Text style={styles.bannerDesc}>
          While our neural engine processes your multi-bracket capture, calibrate your scan by marking what you feel and see.
        </Text>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "ZONES" && styles.tabBtnActive]}
          onPress={() => setActiveTab("ZONES")}
        >
          <Layers size={14} color={activeTab === "ZONES" ? "#10B981" : "#94A3B8"} />
          <Text style={[styles.tabBtnText, activeTab === "ZONES" && styles.tabBtnTextActive]}>
            1. Zone Checklist
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "TOUCH_MARK" && styles.tabBtnActive]}
          onPress={() => setActiveTab("TOUCH_MARK")}
        >
          <MapPin size={14} color={activeTab === "TOUCH_MARK" ? "#10B981" : "#94A3B8"} />
          <Text style={[styles.tabBtnText, activeTab === "TOUCH_MARK" && styles.tabBtnTextActive]}>
            2. Touch-to-Mark ({spotMarkers.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Mode 1: Zone Checklist */}
      {activeTab === "ZONES" && (
        <View style={{ flex: 1 }}>
          {/* Zone Selector Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.zoneScroll}
            contentContainerStyle={styles.zoneScrollContent}
          >
            {ZONES.map((z) => {
              const count = (zoneSelections[z.key] || []).length;
              const isSelected = selectedZone === z.key;
              return (
                <TouchableOpacity
                  key={z.key}
                  style={[styles.zoneChip, isSelected && styles.zoneChipActive]}
                  onPress={() => setSelectedZone(z.key)}
                >
                  <Text style={[styles.zoneChipText, isSelected && styles.zoneChipTextActive]}>
                    {z.label}
                  </Text>
                  {count > 0 && (
                    <View style={styles.badgeCount}>
                      <Text style={styles.badgeCountText}>{count}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Concerns Grid */}
          <ScrollView style={styles.concernsContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionHeader}>
              SELECT CONCERNS VISIBLE ON YOUR {selectedZone.toUpperCase().replace("_", " ")}
            </Text>

            <View style={styles.grid}>
              {CONCERN_CATEGORIES.map((cat) => {
                const active = (zoneSelections[selectedZone] || []).includes(cat.id);
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.gridCard, active && styles.gridCardActive]}
                    onPress={() => toggleConcern(cat.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.cardHeader}>
                      <Text style={[styles.cardTitle, active && styles.cardTitleActive]}>
                        {cat.label}
                      </Text>
                      {active ? (
                        <CheckCircle2 size={16} color="#10B981" />
                      ) : (
                        <Plus size={16} color="#475569" />
                      )}
                    </View>
                    <Text style={styles.cardDesc}>{cat.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Mode 2: Touch-to-Mark */}
      {activeTab === "TOUCH_MARK" && (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <Text style={styles.touchHint}>
            Tap anywhere on the face canvas below to drop a pin on a spot you want scrutinized.
          </Text>

          {/* Interactive Tap Canvas */}
          <Pressable style={styles.canvas} onPress={handleCanvasTap}>
            {/* Silhouette Outline */}
            <View style={styles.silhouetteOval}>
              <View style={styles.silhouetteInnerEyeRow}>
                <View style={styles.eyeSpot} />
                <View style={styles.eyeSpot} />
              </View>
              <View style={styles.noseBridge} />
              <View style={styles.mouthLine} />
            </View>

            {/* Render Dropped Pins */}
            {spotMarkers.map((marker, index) => (
              <View
                key={marker.id || index}
                style={[
                  styles.pinMarker,
                  {
                    left: `${marker.x * 100}%`,
                    top: `${marker.y * 100}%`,
                  },
                ]}
              >
                <View style={styles.pinDot}>
                  <Text style={styles.pinText}>{index + 1}</Text>
                </View>
              </View>
            ))}
          </Pressable>

          {/* Note Input */}
          <View style={styles.noteInputBox}>
            <TextInput
              style={styles.noteInput}
              placeholder="Optional note for next tap (e.g. itchy or painful)"
              placeholderTextColor="#64748B"
              value={activeNoteText}
              onChangeText={setActiveNoteText}
            />
          </View>

          {/* Pins List */}
          <View style={styles.pinsList}>
            <Text style={styles.pinsListTitle}>MARKED LOCATIONS ({spotMarkers.length})</Text>
            {spotMarkers.map((marker, idx) => (
              <View key={marker.id || idx} style={styles.pinItem}>
                <View style={styles.pinBadge}>
                  <Text style={styles.pinBadgeText}>{idx + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.pinZoneText}>{marker.zone.replace("_", " ").toUpperCase()}</Text>
                  {marker.userNote ? (
                    <Text style={styles.pinNoteText}>{marker.userNote}</Text>
                  ) : (
                    <Text style={styles.pinCoordsText}>
                      Coordinate: ({marker.x.toFixed(2)}, {marker.y.toFixed(2)})
                    </Text>
                  )}
                </View>
                <TouchableOpacity onPress={() => removeSpotMarker(marker.id)}>
                  <Text style={styles.deleteText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Confirmation Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          <Send size={16} color="#0B0F19" />
          <Text style={styles.submitBtnText}>
            {isSubmitting ? "Calibrating Assessment..." : "Confirm & View Dual Validation"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0F19",
  },
  banner: {
    backgroundColor: "rgba(16, 185, 129, 0.08)",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
    margin: 16,
    marginBottom: 8,
  },
  bannerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#10B981",
  },
  bannerDesc: {
    fontSize: 12,
    color: "#94A3B8",
    lineHeight: 16,
  },
  tabBar: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: "#111827",
    borderRadius: 10,
    padding: 4,
    gap: 6,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94A3B8",
  },
  tabBtnTextActive: {
    color: "#10B981",
  },
  zoneScroll: {
    maxHeight: 46,
    marginBottom: 8,
  },
  zoneScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  zoneChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: "#334155",
  },
  zoneChipActive: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  zoneChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94A3B8",
  },
  zoneChipTextActive: {
    color: "#0B0F19",
  },
  badgeCount: {
    backgroundColor: "#0B0F19",
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeCountText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#10B981",
  },
  concernsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 0.8,
    marginVertical: 10,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingBottom: 24,
  },
  gridCard: {
    width: (width - 42) / 2,
    backgroundColor: "#111827",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  gridCardActive: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    borderColor: "#10B981",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#E2E8F0",
  },
  cardTitleActive: {
    color: "#10B981",
  },
  cardDesc: {
    fontSize: 11,
    color: "#64748B",
  },
  touchHint: {
    fontSize: 12,
    color: "#94A3B8",
    marginHorizontal: 16,
    marginBottom: 10,
  },
  canvas: {
    height: 280,
    marginHorizontal: 16,
    backgroundColor: "#111827",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1E293B",
    position: "relative",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  silhouetteOval: {
    width: 170,
    height: 230,
    borderRadius: 85,
    borderWidth: 2,
    borderColor: "rgba(16, 185, 129, 0.35)",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  silhouetteInnerEyeRow: {
    flexDirection: "row",
    width: 80,
    justifyContent: "space-between",
    marginBottom: 20,
  },
  eyeSpot: {
    width: 12,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(16, 185, 129, 0.4)",
  },
  noseBridge: {
    width: 4,
    height: 24,
    borderRadius: 2,
    backgroundColor: "rgba(16, 185, 129, 0.3)",
    marginBottom: 16,
  },
  mouthLine: {
    width: 28,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "rgba(16, 185, 129, 0.3)",
  },
  pinMarker: {
    position: "absolute",
    marginLeft: -14,
    marginTop: -14,
  },
  pinDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  pinText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0B0F19",
  },
  noteInputBox: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
  },
  noteInput: {
    backgroundColor: "#1E293B",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#F1F5F9",
    fontSize: 13,
    borderWidth: 1,
    borderColor: "#334155",
  },
  pinsList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  pinsListTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  pinItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#1F2937",
    gap: 10,
  },
  pinBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
  },
  pinBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0B0F19",
  },
  pinZoneText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#E2E8F0",
  },
  pinNoteText: {
    fontSize: 11,
    color: "#94A3B8",
  },
  pinCoordsText: {
    fontSize: 10,
    color: "#64748B",
  },
  deleteText: {
    fontSize: 11,
    color: "#EF4444",
    fontWeight: "600",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#1F2937",
    backgroundColor: "#0B0F19",
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0B0F19",
  },
});
