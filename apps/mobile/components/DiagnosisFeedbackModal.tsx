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
                <ClipboardCheck size={20} color="#10B981" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Dermatologist Feedback</Text>
                <Text style={styles.headerSub}>Post-Visit Diagnosis Capture</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
              <X size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Question 1 */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Stethoscope size={16} color="#38BDF8" />
                <Text style={styles.sectionTitle}>WHAT WAS YOUR DIAGNOSIS?</Text>
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
                      {isSelected && <Check size={14} color="#38BDF8" />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Question 2 */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Pill size={16} color="#A78BFA" />
                <Text style={styles.sectionTitle}>DID THEY PRESCRIBE ANYTHING?</Text>
              </View>
              <View style={styles.chipsContainer}>
                {COMMON_PRESCRIPTIONS.map((rx) => {
                  const isSelected = selectedPrescriptions.includes(rx);
                  return (
                    <TouchableOpacity
                      key={rx}
                      style={[styles.chip, isSelected && styles.chipSelectedPurple]}
                      onPress={() => togglePrescription(rx)}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextSelectedPurple]}>
                        {rx}
                      </Text>
                      {isSelected && <Check size={14} color="#C084FC" />}
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
                    Anonymously contribute this correction to teach SkinSense to better differentiate this condition.
                  </Text>
                </View>
                <Switch
                  value={consentToTraining}
                  onValueChange={setConsentToTraining}
                  trackColor={{ false: "#334155", true: "#0284C7" }}
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
                <>
                  <Sparkles size={18} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>Reconcile & Update Routine</Text>
                </>
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
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#0F172A",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    paddingTop: 20,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#10B98120",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#F8FAFC",
  },
  headerSub: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#1E293B",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.8,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#1E293B",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
  },
  chipSelected: {
    backgroundColor: "#0284C720",
    borderColor: "#0284C7",
  },
  chipSelectedPurple: {
    backgroundColor: "#8B5CF620",
    borderColor: "#8B5CF6",
  },
  chipText: {
    fontSize: 12,
    color: "#CBD5E1",
    fontWeight: "500",
  },
  chipTextSelected: {
    color: "#38BDF8",
    fontWeight: "700",
  },
  chipTextSelectedPurple: {
    color: "#C084FC",
    fontWeight: "700",
  },
  consentCard: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#334155",
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
    fontSize: 13,
    fontWeight: "700",
    color: "#F8FAFC",
  },
  consentSub: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 4,
    lineHeight: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#1E293B",
    backgroundColor: "#0F172A",
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#10B981",
    borderRadius: 12,
    paddingVertical: 14,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
