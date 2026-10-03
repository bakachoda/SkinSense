import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import {
  BookOpen,
  X,
  Tag,
  Smile,
  AlertTriangle,
  Plus,
  Clock,
  Check,
  Calendar,
} from "lucide-react-native";
import { apiClient } from "../lib/api-client";
import type { SkinDiaryEntry } from "@skinsense/types";

interface SkinDiaryModalProps {
  visible: boolean;
  onClose: () => void;
  scanId?: string;
}

const PRESET_TAGS = [
  { id: "poorSleep", label: "Slept Poorly" },
  { id: "ateDairy", label: "Ate Dairy" },
  { id: "highStress", label: "High Stress" },
  { id: "sweated", label: "Heavy Workout" },
  { id: "newProduct", label: "New Product" },
  { id: "sunExposure", label: "Sun Exposure" },
];

export function SkinDiaryModal({ visible, onClose, scanId }: SkinDiaryModalProps) {
  const [note, setNote] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [skinFeel, setSkinFeel] = useState(50); // 0 = Dry, 50 = Balanced, 100 = Oily
  const [hasIrritation, setHasIrritation] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [entries, setEntries] = useState<SkinDiaryEntry[]>([
    {
      id: "d-1",
      userId: "user-1",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      note: "High stress day at work + stayed up late. Noticed slight cheek flushing.",
      tags: ["highStress", "poorSleep"],
      photos: [],
      promptedAnswers: { skinFeel: 40, irritation: true },
    },
    {
      id: "d-2",
      userId: "user-1",
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      note: "Skin feels soft and supple after Azelaic acid evening routine.",
      tags: ["newProduct"],
      photos: [],
      promptedAnswers: { skinFeel: 50, irritation: false },
    },
  ]);

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter((t) => t !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const handleSave = async () => {
    if (!note.trim() && selectedTags.length === 0) return;
    setSaving(true);
    try {
      const newEntry = await apiClient.createDiaryEntry({
        scanId,
        note: note.trim() || "Daily micro-checkin",
        tags: selectedTags,
        photos: [],
        promptedAnswers: {
          skinFeel,
          irritation: hasIrritation,
        },
      });

      setEntries([newEntry, ...entries]);
      setNote("");
      setSelectedTags([]);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch {
      // Offline fallback
      const localEntry: SkinDiaryEntry = {
        id: `d-${Date.now()}`,
        userId: "user-1",
        createdAt: new Date().toISOString(),
        note: note.trim() || "Daily micro-checkin",
        tags: selectedTags,
        photos: [],
        promptedAnswers: {
          skinFeel,
          irritation: hasIrritation,
        },
      };
      setEntries([localEntry, ...entries]);
      setNote("");
      setSelectedTags([]);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerKicker}>LIFESTYLE & SENSORY LOG</Text>
            <Text style={styles.headerTitle}>Skin Health Diary</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={22} color="#0F172A" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Create Entry Card */}
          <View style={styles.createCard}>
            <Text style={styles.cardSectionTitle}>How does your skin feel today?</Text>

            {/* Slider for Skin Feel */}
            <View style={styles.sliderContainer}>
              <View style={styles.sliderLabelRow}>
                <Text style={styles.sliderMinLabel}>Tight / Dry</Text>
                <Text style={styles.sliderValLabel}>
                  {skinFeel < 40 ? "Dry" : skinFeel > 60 ? "Oily" : "Balanced"} ({skinFeel})
                </Text>
                <Text style={styles.sliderMaxLabel}>Excess Sebum</Text>
              </View>
              <View style={styles.sliderBtnRow}>
                {[20, 35, 50, 65, 80].map((v) => (
                  <TouchableOpacity
                    key={v}
                    style={[
                      styles.feelOption,
                      skinFeel === v && styles.feelOptionActive,
                    ]}
                    onPress={() => setSkinFeel(v)}
                  >
                    <Text
                      style={[
                        styles.feelOptionText,
                        skinFeel === v && styles.feelOptionTextActive,
                      ]}
                    >
                      {v <= 35 ? "Dry" : v >= 65 ? "Oily" : "Normal"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Irritation Toggle */}
            <View style={styles.irritationRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.irritationTitle}>Active Irritation or Stinging?</Text>
                <Text style={styles.irritationSub}>
                  Flag acute barrier compromise
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  hasIrritation && styles.toggleBtnActive,
                ]}
                onPress={() => setHasIrritation(!hasIrritation)}
              >
                <Text
                  style={[
                    styles.toggleBtnText,
                    hasIrritation && styles.toggleBtnTextActive,
                  ]}
                >
                  {hasIrritation ? "YES" : "NO"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Preset Context Chips */}
            <Text style={[styles.cardSectionTitle, { marginTop: 14 }]}>
              Lifestyle Factors
            </Text>
            <View style={styles.tagsWrap}>
              {PRESET_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag.id);
                return (
                  <TouchableOpacity
                    key={tag.id}
                    style={[
                      styles.tagChip,
                      isSelected && styles.tagChipActive,
                    ]}
                    onPress={() => toggleTag(tag.id)}
                  >
                    <Text
                      style={[
                        styles.tagChipText,
                        isSelected && styles.tagChipTextActive,
                      ]}
                    >
                      {tag.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Free-form Note Input */}
            <TextInput
              style={styles.textInput}
              placeholder="Add observation (e.g., diet change, travel, new sunscreen)..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
              value={note}
              onChangeText={setNote}
            />

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : savedSuccess ? (
                <View style={styles.btnInner}>
                  <Check size={16} color="#FFFFFF" />
                  <Text style={styles.saveBtnText}>Saved to Journal</Text>
                </View>
              ) : (
                <View style={styles.btnInner}>
                  <Plus size={16} color="#FFFFFF" />
                  <Text style={styles.saveBtnText}>Record Daily Entry</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Past Diary History */}
          <Text style={styles.historyTitle}>Journal History</Text>
          {entries.map((entry) => (
            <View key={entry.id} style={styles.entryCard}>
              <View style={styles.entryHeader}>
                <View style={styles.entryDateRow}>
                  <Calendar size={13} color="#64748B" />
                  <Text style={styles.entryDate}>
                    {new Date(entry.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                </View>
                {entry.promptedAnswers?.irritation && (
                  <View style={styles.irritationWarningBadge}>
                    <AlertTriangle size={11} color="#DC2626" />
                    <Text style={styles.irritationWarningText}>Stinging</Text>
                  </View>
                )}
              </View>

              <Text style={styles.entryNote}>{entry.note}</Text>

              {entry.tags.length > 0 && (
                <View style={styles.entryTagsRow}>
                  {entry.tags.map((t, idx) => (
                    <View key={idx} style={styles.entryTagBadge}>
                      <Text style={styles.entryTagText}>#{t}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerKicker: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0284C7",
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.4,
  },
  closeBtn: {
    padding: 6,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  createCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardSectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 8,
  },
  sliderContainer: {
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12,
  },
  sliderLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sliderMinLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
  sliderValLabel: {
    fontSize: 12,
    color: "#0284C7",
    fontWeight: "800",
  },
  sliderMaxLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
  sliderBtnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
  },
  feelOption: {
    flex: 1,
    paddingVertical: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 6,
    alignItems: "center",
  },
  feelOptionActive: {
    backgroundColor: "#0284C7",
    borderColor: "#0284C7",
  },
  feelOptionText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },
  feelOptionTextActive: {
    color: "#FFFFFF",
  },
  irritationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  irritationTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E293B",
  },
  irritationSub: {
    fontSize: 11,
    color: "#64748B",
  },
  toggleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  toggleBtnActive: {
    backgroundColor: "#DC2626",
    borderColor: "#DC2626",
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#475569",
  },
  toggleBtnTextActive: {
    color: "#FFFFFF",
  },
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  tagChipActive: {
    backgroundColor: "#0F172A",
    borderColor: "#0F172A",
  },
  tagChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  tagChipTextActive: {
    color: "#FFFFFF",
  },
  textInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
    color: "#0F172A",
    textAlignVertical: "top",
    minHeight: 70,
    marginBottom: 12,
  },
  saveBtn: {
    backgroundColor: "#0F172A",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  btnInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 6,
  },
  entryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  entryDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  entryDate: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  irritationWarningBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  irritationWarningText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#DC2626",
  },
  entryNote: {
    fontSize: 13,
    color: "#334155",
    lineHeight: 18,
  },
  entryTagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    marginTop: 8,
  },
  entryTagBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  entryTagText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
  },
});
