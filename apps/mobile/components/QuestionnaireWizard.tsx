import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuestionnaireStore } from "../stores/questionnaire";
import type { SkinTypeType, SkinConcernType, AgeRangeType } from "@skinsense/types";
import { Check, ChevronRight, Sparkles, HelpCircle } from "lucide-react-native";

interface Props {
  onComplete?: () => void;
  isModal?: boolean;
}

const SKIN_TYPES: { type: SkinTypeType; title: string; desc: string }[] = [
  { type: "OILY", title: "Oily", desc: "Shiny by midday, visible pores, prone to congestion" },
  { type: "DRY", title: "Dry", desc: "Feels tight, flaky, often matte or rough" },
  { type: "COMBINATION", title: "Combination", desc: "Oily T-zone (forehead, nose), normal or dry cheeks" },
  { type: "NORMAL", title: "Normal", desc: "Balanced, comfortable, minimal breakouts" },
  { type: "SENSITIVE", title: "Sensitive", desc: "Flushes easily, stings with new actives, reactive" },
];

const SKIN_CONCERNS: { type: SkinConcernType; label: string; icon: string }[] = [
  { type: "ACNE", label: "Acne & Breakouts", icon: "🔴" },
  { type: "REDNESS", label: "Redness & Irritation", icon: "🟡" },
  { type: "PIGMENTATION", label: "Dark Spots & Uneven Tone", icon: "🟤" },
  { type: "DRYNESS", label: "Dryness & Dehydration", icon: "💧" },
  { type: "FINE_LINES", label: "Fine Lines & Wrinkles", icon: "⏳" },
  { type: "OILINESS", label: "Excess Oil & Shine", icon: "✨" },
  { type: "TEXTURE", label: "Rough Texture & Pores", icon: "🫧" },
  { type: "SENSITIVITY", label: "Barrier Sensitivity", icon: "🛡️" },
];

const COMMON_ALLERGIES = [
  "Fragrance / Parfum",
  "Essential oils",
  "Salicylic acid",
  "Benzoyl peroxide",
  "Retinol / Retinoids",
  "AHA (Glycolic, Lactic acid)",
  "Niacinamide",
  "Vitamin C (L-Ascorbic Acid)",
];

const AGE_RANGES: { range: AgeRangeType; label: string }[] = [
  { range: "TEENS", label: "Teens" },
  { range: "TWENTIES", label: "20s" },
  { range: "THIRTIES", label: "30s" },
  { range: "FORTIES", label: "40s" },
  { range: "FIFTIES_PLUS", label: "50s+" },
];

export function QuestionnaireWizard({ onComplete }: Props) {
  const [step, setStep] = useState<number>(1);
  const [showMiniQuiz, setShowMiniQuiz] = useState<boolean>(false);
  const [customAllergy, setCustomAllergy] = useState<string>("");

  const {
    questionnaire,
    setSkinType,
    toggleConcern,
    toggleAllergy,
    addAllergy,
    setAgeRange,
    setIsPregnant,
    completeQuestionnaire,
  } = useQuestionnaireStore();

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      completeQuestionnaire();
      onComplete?.();
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Progress Steps */}
      <View style={styles.header}>
        <View style={styles.stepIndicator}>
          {[1, 2, 3, 4].map((i) => (
            <View
              key={i}
              style={[
                styles.stepDot,
                i === step ? styles.stepDotActive : i < step ? styles.stepDotCompleted : {},
              ]}
            />
          ))}
        </View>
        <Text style={styles.stepSubtitle}>Step {step} of 4</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Step 1: Skin Type */}
        {step === 1 && (
          <View>
            <Text style={styles.title}>What's your skin type?</Text>
            <Text style={styles.description}>
              Select the option that best describes how your bare skin feels a few hours after washing.
            </Text>

            {SKIN_TYPES.map((item) => {
              const isSelected = questionnaire.skinType === item.type;
              return (
                <TouchableOpacity
                  key={item.type}
                  style={[styles.card, isSelected && styles.cardSelected]}
                  onPress={() => setSkinType(item.type)}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
                      {item.title}
                    </Text>
                    {isSelected && <Check size={20} color="#10B981" />}
                  </View>
                  <Text style={styles.cardDesc}>{item.desc}</Text>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={styles.quizButton}
              onPress={() => setShowMiniQuiz(!showMiniQuiz)}
            >
              <HelpCircle size={16} color="#60A5FA" />
              <Text style={styles.quizButtonText}>
                {showMiniQuiz ? "Hide mini-quiz" : "Not sure? Take 30-second mini-quiz"}
              </Text>
            </TouchableOpacity>

            {showMiniQuiz && (
              <View style={styles.miniQuizBox}>
                <Text style={styles.miniQuizTitle}>Quick Diagnosis:</Text>
                <Text style={styles.miniQuizItem}>1. Midday shine on forehead & nose? → Combination</Text>
                <Text style={styles.miniQuizItem}>2. Tightness after rinsing with water? → Dry</Text>
                <Text style={styles.miniQuizItem}>3. Overall shine and large pores? → Oily</Text>
              </View>
            )}
          </View>
        )}

        {/* Step 2: Skin Concerns */}
        {step === 2 && (
          <View>
            <Text style={styles.title}>What are your main concerns?</Text>
            <Text style={styles.description}>
              Choose up to 3 concerns to prioritize in your formulation routine. (Selected: {questionnaire.concerns.length}/3)
            </Text>

            <View style={styles.concernsGrid}>
              {SKIN_CONCERNS.map((item) => {
                const isSelected = questionnaire.concerns.includes(item.type);
                return (
                  <TouchableOpacity
                    key={item.type}
                    style={[styles.concernChip, isSelected && styles.concernChipSelected]}
                    onPress={() => toggleConcern(item.type)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.concernIcon}>{item.icon}</Text>
                    <Text
                      style={[
                        styles.concernLabel,
                        isSelected && styles.concernLabelSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {isSelected && <Check size={16} color="#10B981" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Step 3: Allergies & Sensitivities */}
        {step === 3 && (
          <View>
            <Text style={styles.title}>Any sensitivities or allergies?</Text>
            <Text style={styles.description}>
              We will strictly filter our product engine to exclude any ingredients you select.
            </Text>

            <View style={styles.allergyList}>
              {COMMON_ALLERGIES.map((allergy) => {
                const isSelected = questionnaire.allergies.includes(allergy);
                return (
                  <TouchableOpacity
                    key={allergy}
                    style={[styles.allergyItem, isSelected && styles.allergyItemSelected]}
                    onPress={() => toggleAllergy(allergy)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.allergyText,
                        isSelected && styles.allergyTextSelected,
                      ]}
                    >
                      {allergy}
                    </Text>
                    {isSelected && <Check size={18} color="#10B981" />}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Custom Allergy Input */}
            <View style={styles.customInputRow}>
              <TextInput
                style={styles.input}
                placeholder="Add custom ingredient (e.g. Lavender oil)..."
                placeholderTextColor="#6B7280"
                value={customAllergy}
                onChangeText={setCustomAllergy}
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  addAllergy(customAllergy);
                  setCustomAllergy("");
                }}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            {questionnaire.allergies.length === 0 && (
              <Text style={styles.noteText}>✓ No known sensitivities selected</Text>
            )}
          </View>
        )}

        {/* Step 4: Demographics & Safety */}
        {step === 4 && (
          <View>
            <Text style={styles.title}>About your profile</Text>
            <Text style={styles.description}>
              Helps calibrate age-appropriate active concentrations and safety contraindications.
            </Text>

            <Text style={styles.fieldLabel}>Age Range:</Text>
            <View style={styles.ageRow}>
              {AGE_RANGES.map((item) => {
                const isSelected = questionnaire.ageRange === item.range;
                return (
                  <TouchableOpacity
                    key={item.range}
                    style={[styles.ageButton, isSelected && styles.ageButtonSelected]}
                    onPress={() => setAgeRange(item.range)}
                  >
                    <Text
                      style={[
                        styles.ageButtonText,
                        isSelected && styles.ageButtonTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.pregnancyCard}>
              <View style={styles.pregnancyInfo}>
                <Text style={styles.pregnancyTitle}>Pregnant or Breastfeeding?</Text>
                <Text style={styles.pregnancyDesc}>
                  Automatically excludes Retinoids, high-strength Salicylic Acid, and Benzoyl Peroxide.
                </Text>
              </View>
              <Switch
                value={questionnaire.isPregnant}
                onValueChange={setIsPregnant}
                trackColor={{ false: "#374151", true: "#059669" }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        {step > 1 && (
          <TouchableOpacity style={styles.backButton} onPress={handlePrev}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {step === 4 ? "Complete Profile" : "Continue"}
          </Text>
          <ChevronRight size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0F17",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  stepIndicator: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  stepDot: {
    flex: 1,
    height: 4,
    backgroundColor: "#1F2937",
    borderRadius: 2,
  },
  stepDotActive: {
    backgroundColor: "#3B82F6",
  },
  stepDotCompleted: {
    backgroundColor: "#10B981",
  },
  stepSubtitle: {
    fontSize: 12,
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#F9FAFB",
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: "#9CA3AF",
    lineHeight: 22,
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#161E2E",
    borderWidth: 1.5,
    borderColor: "#1F2937",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  cardSelected: {
    borderColor: "#10B981",
    backgroundColor: "#0F281E",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#F3F4F6",
  },
  cardTitleSelected: {
    color: "#10B981",
  },
  cardDesc: {
    fontSize: 14,
    color: "#9CA3AF",
    lineHeight: 20,
  },
  quizButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingVertical: 8,
  },
  quizButtonText: {
    fontSize: 14,
    color: "#60A5FA",
    fontWeight: "500",
  },
  miniQuizBox: {
    backgroundColor: "#1E293B",
    borderRadius: 10,
    padding: 14,
    marginTop: 10,
  },
  miniQuizTitle: {
    color: "#F3F4F6",
    fontWeight: "600",
    marginBottom: 6,
  },
  miniQuizItem: {
    color: "#CBD5E1",
    fontSize: 13,
    lineHeight: 20,
  },
  concernsGrid: {
    gap: 10,
  },
  concernChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161E2E",
    borderWidth: 1.5,
    borderColor: "#1F2937",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  concernChipSelected: {
    borderColor: "#10B981",
    backgroundColor: "#0F281E",
  },
  concernIcon: {
    fontSize: 18,
  },
  concernLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#D1D5DB",
  },
  concernLabelSelected: {
    color: "#F9FAFB",
    fontWeight: "600",
  },
  allergyList: {
    gap: 8,
    marginBottom: 16,
  },
  allergyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#161E2E",
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  allergyItemSelected: {
    borderColor: "#EF4444",
    backgroundColor: "#2E1515",
  },
  allergyText: {
    fontSize: 14,
    color: "#D1D5DB",
  },
  allergyTextSelected: {
    color: "#FCA5A5",
    fontWeight: "600",
  },
  customInputRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: "#161E2E",
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#F9FAFB",
    fontSize: 14,
  },
  addButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 10,
    paddingHorizontal: 18,
    justifyContent: "center",
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  noteText: {
    color: "#10B981",
    fontSize: 13,
    marginTop: 4,
  },
  fieldLabel: {
    color: "#D1D5DB",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  ageRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  ageButton: {
    flex: 1,
    backgroundColor: "#161E2E",
    borderWidth: 1.5,
    borderColor: "#1F2937",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  ageButtonSelected: {
    borderColor: "#10B981",
    backgroundColor: "#0F281E",
  },
  ageButtonText: {
    color: "#9CA3AF",
    fontSize: 14,
    fontWeight: "500",
  },
  ageButtonTextSelected: {
    color: "#10B981",
    fontWeight: "700",
  },
  pregnancyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161E2E",
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 14,
    padding: 16,
  },
  pregnancyInfo: {
    flex: 1,
    paddingRight: 16,
  },
  pregnancyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#F3F4F6",
    marginBottom: 4,
  },
  pregnancyDesc: {
    fontSize: 13,
    color: "#9CA3AF",
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#1F2937",
    gap: 12,
  },
  backButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#374151",
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    color: "#D1D5DB",
    fontWeight: "600",
    fontSize: 15,
  },
  nextButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#10B981",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
});
