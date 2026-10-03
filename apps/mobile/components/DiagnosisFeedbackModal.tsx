import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  ClipboardCheck,
  X,
  Stethoscope,
  Pill,
  Check,
  ShieldCheck,
  Sparkles,
} from "lucide-react-native";

interface DiagnosisFeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  onDiagnosisSubmitted?: (diagnosis: string, prescriptions: string[]) => void;
}

const COMMON_DIAGNOSES = [
  "Acne vulgaris",
  "Rosacea (Erythematotelangiectatic)",
  "Fungal folliculitis (Pityrosporum)",
  "Perioral dermatitis",
  "Contact dermatitis",
  "Seborrheic dermatitis",
  "Chloasma / Melasma",
  "Postinflammatory hyperpigmentation (PIH)",
];

const COMMON_PRESCRIPTIONS = [
  "Tretinoin 0.025% / 0.05%",
  "Adapalene 0.1% / 0.3%",
  "Metronidazole 0.75% Gel",
  "Doxycycline (Oral)",
  "Spironolactone (Oral)",
  "Isotretinoin / Accutane (Oral)",
  "Ketoconazole 2% Cream",
  "Azelaic Acid 15% (Rx Finacea)",
];

export function DiagnosisFeedbackModal({
  visible,
  onClose,
  onDiagnosisSubmitted,
}: DiagnosisFeedbackModalProps) {
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<string | null>(null);
  const [selectedPrescriptions, setSelectedPrescriptions] = useState<string[]>([]);
  const [consentToTraining, setConsentToTraining] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const togglePrescription = (rx: string) => {
    setSelectedPrescriptions((prev) =>
      prev.includes(rx) ? prev.filter((p) => p !== rx) : [...prev, rx],
    );
  };

  const handleSubmit = () => {
    if (!selectedDiagnosis) {
      Alert.alert("Select Diagnosis", "Please select what diagnosis your dermatologist gave you.");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      if (onDiagnosisSubmitted) {
        onDiagnosisSubmitted(selectedDiagnosis, selectedPrescriptions);
      }
      Alert.alert(
        "Treatment Reconciled",
        `Your diagnosis (${selectedDiagnosis}) has been recorded. Your routine has automatically paused conflicting OTC exfoliants to prioritize your prescription.`,
        [{ text: "OK", onPress: onClose }],
      );
    }, 900);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <ClipboardCheck size={16} color="#111827" />
              </View>
              <View>
                <Text style={styles.headerTitle}>LOG DOCTOR DIAGNOSIS</Text>
                <Text style={styles.headerSub}>Reconcile Rx With OTC Regimen</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
              <X size={18} color="#111827" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Question 1 */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Stethoscope size={14} color="#111827" />
                <Text style={styles.sectionTitle}>DERMATOLOGIST DIAGNOSIS</Text>
              </View>
              <View style={styles.chipsContainer}>
                {COMMON_DIAGNOSES.map((diag) => {
                  const isSelected = selectedDiagnosis === diag;
                  return (
                    <TouchableOpacity
                      key={diag}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                      onPress={() => setSelectedDiagnosis(diag)}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                        {diag}
                      </Text>
                      {isSelected && <Check size={12} color="#FFFFFF" />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Question 2 */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Pill size={14} color="#111827" />
                <Text style={styles.sectionTitle}>CONCURRENT PRESCRIPTIONS</Text>
              </View>
              <View style={styles.chipsContainer}>
                {COMMON_PRESCRIPTIONS.map((rx) => {
                  const isSelected = selectedPrescriptions.includes(rx);
                  return (
                    <TouchableOpacity
                      key={rx}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                      onPress={() => togglePrescription(rx)}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                        {rx}
                      </Text>
                      {isSelected && <Check size={12} color="#FFFFFF" />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Consent to training */}
            <View style={styles.consentCard}>
              <View style={styles.consentTop}>
                <View style={styles.consentLeft}>
                  <Text style={styles.consentTitle}>Model Calibration Consent</Text>
                  <Text style={styles.consentSub}>
                    Anonymously contribute this correction to teach SkinSense computer vision.
                  </Text>
                </View>
                <Switch
                  value={consentToTraining}
                  onValueChange={setConsentToTraining}
                  trackColor={{ false: "#E5E7EB", true: "#111827" }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>RECONCILE & UPDATE ROUTINE</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.4)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "85%",
    paddingTop: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 6,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  headerSub: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 2,
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: "#F3F4F6",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  chipSelected: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  chipText: {
    fontSize: 11,
    color: "#4B5563",
    fontWeight: "600",
  },
  chipTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  consentCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  consentTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  consentLeft: {
    flex: 1,
    marginRight: 12,
  },
  consentTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#111827",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  consentSub: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 2,
    lineHeight: 14,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  submitBtn: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111827",
    borderRadius: 8,
    paddingVertical: 12,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
});
