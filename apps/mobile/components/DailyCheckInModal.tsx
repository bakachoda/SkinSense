import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from "react-native";
import {
  Moon,
  Droplets,
  Brain,
  Dumbbell,
  Sun,
  Apple,
  X,
  Check,
  ChevronRight,
} from "lucide-react-native";
import type { LifestyleCheckIn, DietTag } from "@skinsense/types";

const { width } = Dimensions.get("window");

interface DailyCheckInModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (checkIn: LifestyleCheckIn) => void;
}

const DIET_TAGS: { id: DietTag; emoji: string; label: string }[] = [
  { id: "dairy", emoji: "🥛", label: "Dairy" },
  { id: "sugar", emoji: "🍬", label: "Sugar" },
  { id: "alcohol", emoji: "🍷", label: "Alcohol" },
  { id: "caffeine", emoji: "☕", label: "Caffeine" },
  { id: "processed", emoji: "🍔", label: "Processed" },
  { id: "gluten", emoji: "🍞", label: "Gluten" },
  { id: "spicy", emoji: "🌶️", label: "Spicy" },
  { id: "fruits_veggies", emoji: "🥗", label: "Fruits & Veg" },
  { id: "supplements", emoji: "💊", label: "Supplements" },
  { id: "water_rich", emoji: "🥒", label: "Water-rich" },
];

const STRESS_EMOJIS = ["😌", "🙂", "😐", "😰", "🤯"];
const STRESS_LABELS = ["Very Calm", "Relaxed", "Neutral", "Stressed", "Very Stressed"];

export function DailyCheckInModal({ visible, onClose, onSubmit }: DailyCheckInModalProps) {
  const [step, setStep] = useState(0);
  const [sleepHours, setSleepHours] = useState(7);
  const [waterGlasses, setWaterGlasses] = useState(8);
  const [stressLevel, setStressLevel] = useState(3);
  const [exerciseMinutes, setExerciseMinutes] = useState(0);
  const [sunExposureMinutes, setSunExposureMinutes] = useState(30);
  const [dietTags, setDietTags] = useState<DietTag[]>([]);

  const resetForm = () => {
    setStep(0);
    setSleepHours(7);
    setWaterGlasses(8);
    setStressLevel(3);
    setExerciseMinutes(0);
    setSunExposureMinutes(30);
    setDietTags([]);
  };

  const handleSubmit = () => {
    onSubmit({
      sleepHours,
      waterGlasses,
      stressLevel,
      exerciseMinutes,
      sunExposureMinutes,
      dietTags,
    });
    resetForm();
    onClose();
  };

  const toggleDietTag = (tag: DietTag) => {
    setDietTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const totalSteps = 4;

  const renderSliderRow = (
    value: number,
    setValue: (v: number) => void,
    min: number,
    max: number,
    stepSize: number,
    unit: string,
  ) => {
    const steps = [];
    for (let v = min; v <= max; v += stepSize) {
      steps.push(v);
    }
    return (
      <View style={styles.sliderContainer}>
        <View style={styles.sliderTrack}>
          {steps.map((v) => (
            <TouchableOpacity
              key={v}
              onPress={() => setValue(v)}
              style={[
                styles.sliderDot,
                v <= value && styles.sliderDotActive,
              ]}
            >
              {v === value && (
                <View style={styles.sliderThumb}>
                  <Text style={styles.sliderThumbText}>{v}{unit}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>{min}{unit}</Text>
          <Text style={styles.sliderLabel}>{max}{unit}</Text>
        </View>
      </View>
    );
  };

  const renderStep = () => {
    switch (step) {
      case 0: // Sleep & Water
        return (
          <View style={styles.stepContent}>
            <View style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <Moon size={22} color="#818CF8" />
                <Text style={styles.questionTitle}>Hours of Sleep</Text>
              </View>
              <Text style={styles.questionSub}>How many hours did you sleep last night?</Text>
              {renderSliderRow(sleepHours, setSleepHours, 3, 12, 1, "h")}
            </View>

            <View style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <Droplets size={22} color="#60A5FA" />
                <Text style={styles.questionTitle}>Water Intake</Text>
              </View>
              <Text style={styles.questionSub}>Glasses of water today</Text>
              {renderSliderRow(waterGlasses, setWaterGlasses, 0, 16, 2, "")}
            </View>
          </View>
        );

      case 1: // Stress
        return (
          <View style={styles.stepContent}>
            <View style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <Brain size={22} color="#F472B6" />
                <Text style={styles.questionTitle}>Stress Level</Text>
              </View>
              <Text style={styles.questionSub}>How stressed are you feeling?</Text>
              <View style={styles.emojiRow}>
                {STRESS_EMOJIS.map((emoji, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setStressLevel(i + 1)}
                    style={[
                      styles.emojiButton,
                      stressLevel === i + 1 && styles.emojiButtonActive,
                    ]}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                    <Text style={[
                      styles.emojiLabel,
                      stressLevel === i + 1 && styles.emojiLabelActive,
                    ]}>
                      {STRESS_LABELS[i]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );

      case 2: // Exercise & Sun
        return (
          <View style={styles.stepContent}>
            <View style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <Dumbbell size={22} color="#34D399" />
                <Text style={styles.questionTitle}>Exercise</Text>
              </View>
              <Text style={styles.questionSub}>Minutes of physical activity</Text>
              {renderSliderRow(exerciseMinutes, setExerciseMinutes, 0, 120, 15, "m")}
            </View>

            <View style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <Sun size={22} color="#FBBF24" />
                <Text style={styles.questionTitle}>Sun Exposure</Text>
              </View>
              <Text style={styles.questionSub}>Unprotected sun exposure today</Text>
              {renderSliderRow(sunExposureMinutes, setSunExposureMinutes, 0, 180, 30, "m")}
            </View>
          </View>
        );

      case 3: // Diet
        return (
          <View style={styles.stepContent}>
            <View style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <Apple size={22} color="#F97316" />
                <Text style={styles.questionTitle}>Diet Today</Text>
              </View>
              <Text style={styles.questionSub}>What did you consume? (select all that apply)</Text>
              <View style={styles.dietGrid}>
                {DIET_TAGS.map((tag) => (
                  <TouchableOpacity
                    key={tag.id}
                    onPress={() => toggleDietTag(tag.id)}
                    style={[
                      styles.dietChip,
                      dietTags.includes(tag.id) && styles.dietChipActive,
                    ]}
                  >
                    <Text style={styles.dietEmoji}>{tag.emoji}</Text>
                    <Text style={[
                      styles.dietLabel,
                      dietTags.includes(tag.id) && styles.dietLabelActive,
                    ]}>
                      {tag.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Daily Check-In</Text>
              <Text style={styles.subtitle}>
                Step {step + 1} of {totalSteps} · 30 seconds
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Progress bar */}
          <View style={styles.progressBar}>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressSegment,
                  i <= step && styles.progressSegmentActive,
                ]}
              />
            ))}
          </View>

          {/* Content */}
          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {renderStep()}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            {step > 0 && (
              <TouchableOpacity
                onPress={() => setStep((s) => s - 1)}
                style={styles.backBtn}
              >
                <Text style={styles.backBtnText}>Back</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={step < totalSteps - 1 ? () => setStep((s) => s + 1) : handleSubmit}
              style={styles.nextBtn}
            >
              {step < totalSteps - 1 ? (
                <>
                  <Text style={styles.nextBtnText}>Next</Text>
                  <ChevronRight size={18} color="#fff" />
                </>
              ) : (
                <>
                  <Check size={18} color="#fff" />
                  <Text style={styles.nextBtnText}>Log Check-In</Text>
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
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#111827",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "88%",
    paddingBottom: 34,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#F9FAFB",
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1F2937",
    alignItems: "center",
    justifyContent: "center",
  },
  progressBar: {
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#374151",
  },
  progressSegmentActive: {
    backgroundColor: "#818CF8",
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  stepContent: {
    gap: 16,
    paddingBottom: 20,
  },
  questionCard: {
    backgroundColor: "#1F2937",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#374151",
  },
  questionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  questionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#F9FAFB",
  },
  questionSub: {
    fontSize: 13,
    color: "#9CA3AF",
    marginBottom: 16,
  },
  sliderContainer: {
    gap: 8,
  },
  sliderTrack: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 40,
  },
  sliderDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#374151",
    position: "relative",
    alignItems: "center",
  },
  sliderDotActive: {
    backgroundColor: "#818CF8",
  },
  sliderThumb: {
    position: "absolute",
    top: -30,
    backgroundColor: "#818CF8",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 36,
    alignItems: "center",
  },
  sliderThumbText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sliderLabel: {
    fontSize: 11,
    color: "#6B7280",
  },
  emojiRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
  },
  emojiButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#111827",
    borderWidth: 1.5,
    borderColor: "#374151",
  },
  emojiButtonActive: {
    borderColor: "#818CF8",
    backgroundColor: "rgba(129, 140, 248, 0.1)",
  },
  emojiText: {
    fontSize: 28,
    marginBottom: 4,
  },
  emojiLabel: {
    fontSize: 9,
    color: "#6B7280",
    textAlign: "center",
  },
  emojiLabelActive: {
    color: "#818CF8",
    fontWeight: "600",
  },
  dietGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  dietChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#111827",
    borderWidth: 1.5,
    borderColor: "#374151",
  },
  dietChipActive: {
    borderColor: "#F97316",
    backgroundColor: "rgba(249, 115, 22, 0.1)",
  },
  dietEmoji: {
    fontSize: 16,
  },
  dietLabel: {
    fontSize: 13,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  dietLabelActive: {
    color: "#F97316",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#1F2937",
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#1F2937",
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#818CF8",
    flex: 1,
    justifyContent: "center",
  },
  nextBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
});
