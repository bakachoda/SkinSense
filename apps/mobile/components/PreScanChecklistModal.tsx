import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { CheckCircle2, Circle, Sparkles, Activity, Flame, Glasses, ArrowRight } from "lucide-react-native";
import type { PhysiologicalState } from "@skinsense/types";

interface PreScanChecklistModalProps {
  visible: boolean;
  onProceed: (state: PhysiologicalState) => void;
  onDismiss: () => void;
}

interface PrepCheckState {
  cleanse: boolean;
  wait: boolean;
  hair: boolean;
  dry: boolean;
}

export function PreScanChecklistModal({
  visible,
  onProceed,
  onDismiss,
}: PreScanChecklistModalProps) {
  const [prepChecked, setPrepChecked] = useState<PrepCheckState>({
    cleanse: true,
    wait: true,
    hair: true,
    dry: true,
  });

  const [exercised, setExercised] = useState<boolean>(false);
  const [hotShower, setHotShower] = useState<boolean>(false);

  const toggleCheck = (key: keyof PrepCheckState) => {
    setPrepChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleContinue = () => {
    onProceed({
      exercised,
      hotShower,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconCircle}>
                <Sparkles size={22} color="#10B981" />
              </View>
              <Text style={styles.title}>Diagnostic Prep Checklist</Text>
              <Text style={styles.subtitle}>
                Phase 3 captures clinical-grade high resolution data. Follow these steps for best results.
              </Text>
            </View>

            {/* Checklist items */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>SKIN PREPARATION</Text>

              <TouchableOpacity
                style={styles.checkRow}
                onPress={() => toggleCheck("cleanse")}
                activeOpacity={0.7}
              >
                {prepChecked.cleanse ? (
                  <CheckCircle2 size={20} color="#10B981" />
                ) : (
                  <Circle size={20} color="#6B7280" />
                )}
                <Text style={styles.checkText}>Cleanse your face (remove makeup & SPF)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.checkRow}
                onPress={() => toggleCheck("wait")}
                activeOpacity={0.7}
              >
                {prepChecked.wait ? (
                  <CheckCircle2 size={20} color="#10B981" />
                ) : (
                  <Circle size={20} color="#6B7280" />
                )}
                <Text style={styles.checkText}>Wait ~15 minutes after washing (sebum equilibrium)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.checkRow}
                onPress={() => toggleCheck("hair")}
                activeOpacity={0.7}
              >
                {prepChecked.hair ? (
                  <CheckCircle2 size={20} color="#10B981" />
                ) : (
                  <Circle size={20} color="#6B7280" />
                )}
                <Text style={styles.checkText}>Pin or tuck hair back away from forehead</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.checkRow}
                onPress={() => toggleCheck("dry")}
                activeOpacity={0.7}
              >
                {prepChecked.dry ? (
                  <CheckCircle2 size={20} color="#10B981" />
                ) : (
                  <Circle size={20} color="#6B7280" />
                )}
                <Text style={styles.checkText}>Pat skin gently dry with clean towel</Text>
              </TouchableOpacity>
            </View>

            {/* Quick State Questions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>PHYSIOLOGICAL STATE</Text>
              <Text style={styles.stateSubtitle}>
                Thermal dilation impacts facial redness scoring. Let us know your recent state:
              </Text>

              {/* Question 1 */}
              <View style={styles.questionCard}>
                <View style={styles.questionHeader}>
                  <Activity size={18} color="#3B82F6" />
                  <Text style={styles.questionText}>Exercised in the last 30 minutes?</Text>
                </View>
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.choiceBtn, !exercised && styles.choiceBtnActive]}
                    onPress={() => setExercised(false)}
                  >
                    <Text style={[styles.choiceText, !exercised && styles.choiceTextActive]}>No</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.choiceBtn, exercised && styles.choiceBtnActive]}
                    onPress={() => setExercised(true)}
                  >
                    <Text style={[styles.choiceText, exercised && styles.choiceTextActive]}>Yes</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Question 2 */}
              <View style={styles.questionCard}>
                <View style={styles.questionHeader}>
                  <Flame size={18} color="#F59E0B" />
                  <Text style={styles.questionText}>Hot shower in the last 20 minutes?</Text>
                </View>
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.choiceBtn, !hotShower && styles.choiceBtnActive]}
                    onPress={() => setHotShower(false)}
                  >
                    <Text style={[styles.choiceText, !hotShower && styles.choiceTextActive]}>No</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.choiceBtn, hotShower && styles.choiceBtnActive]}
                    onPress={() => setHotShower(true)}
                  >
                    <Text style={[styles.choiceText, hotShower && styles.choiceTextActive]}>Yes</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Glasses Note */}
            <View style={styles.glassesBox}>
              <Glasses size={18} color="#A78BFA" />
              <Text style={styles.glassesText}>
                Please remove eyeglasses for accurate periorbital & nasal analysis.
              </Text>
            </View>
          </ScrollView>

          {/* Action button */}
          <TouchableOpacity style={styles.primaryButton} onPress={handleContinue} activeOpacity={0.85}>
            <Text style={styles.primaryButtonText}>Got it, Let's Scan</Text>
            <ArrowRight size={18} color="#0B0F19" />
          </TouchableOpacity>
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
  card: {
    backgroundColor: "#111827",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "88%",
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F9FAFB",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 18,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#10B981",
    letterSpacing: 1,
    marginBottom: 10,
  },
  stateSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 10,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
    gap: 12,
  },
  checkText: {
    fontSize: 14,
    color: "#E5E7EB",
    flex: 1,
  },
  questionCard: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#334155",
  },
  questionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  questionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#F3F4F6",
    flex: 1,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },
  choiceBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#0F172A",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  choiceBtnActive: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    borderColor: "#10B981",
  },
  choiceText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#94A3B8",
  },
  choiceTextActive: {
    color: "#10B981",
  },
  glassesBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(139, 92, 246, 0.1)",
    borderRadius: 10,
    padding: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.25)",
  },
  glassesText: {
    fontSize: 12,
    color: "#C4B5FD",
    flex: 1,
    lineHeight: 16,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0B0F19",
  },
});
