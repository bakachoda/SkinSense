import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiClient } from "../../lib/api-client";
import type { Routine, RoutineStep } from "@skinsense/types";
import {
  Sun,
  Moon,
  Check,
  CheckCircle2,
  Circle,
  Barcode,
  Sparkles,
  Flame,
} from "lucide-react-native";
import { PhasedRoutineCalendar } from "../../components/PhasedRoutineCalendar";
import { BarcodeScannerModal } from "../../components/BarcodeScannerModal";

export default function RoutineScreen() {
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"AM" | "PM">("AM");
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [adherenceLogged, setAdherenceLogged] = useState<boolean>(false);
  const [streakCount] = useState<number>(7);
  const [isBarcodeModalVisible, setIsBarcodeModalVisible] = useState(false);

  useEffect(() => {
    async function fetchRoutine() {
      try {
        const res = await apiClient.getLatestRoutine();
        setRoutine(res.routine);
      } catch {
        // Fallback default routine for preview
        setRoutine({
          id: "routine-default",
          scanResultId: "scan-001",
          version: 1,
          amSteps: [
            {
              order: 1,
              stepType: "CLEANSER",
              productId: "prod-1",
              productName: "Salicylic Acid + LHA 2% Cleanser",
              productBrand: "Minimalist",
              targetIngredients: ["Salicylic Acid 2%", "LHA (Capryloyl Salicylic)", "Zinc PCA"],
              whyChosen: "Removes excess sebum and unclogs pores without disrupting epidermal barrier",
              applicationNote: "Wash for 60 seconds with lukewarm water",
            },
            {
              order: 2,
              stepType: "SERUM",
              productId: "prod-2",
              productName: "Niacinamide 10% Face Serum",
              productBrand: "Minimalist",
              targetIngredients: ["Niacinamide 10%", "Zinc PCA 1%", "Matmarine"],
              whyChosen: "Regulates sebaceous activity and fades post-inflammatory erythema",
              applicationNote: "Dispense 3-4 drops across entire facial canvas",
            },
            {
              order: 3,
              stepType: "MOISTURIZER",
              productId: "prod-3",
              productName: "Dragon Fruit Bounce Jelly Moisturizer",
              productBrand: "Dot & Key",
              targetIngredients: ["Plant PDRN", "Hyaluronic Acid"],
              whyChosen: "Non-greasy aqueous hydration matrix for high humectant moisture retention",
              applicationNote: "Smooth evenly over face and cervical region",
            },
            {
              order: 4,
              stepType: "SPF",
              productId: "prod-4",
              productName: "1% Hyaluronic Sunscreen Aqua Gel SPF 50",
              productBrand: "The Derma Co",
              targetIngredients: ["Hyaluronic Acid 1%", "Vitamin E", "Broad Spectrum PA++++"],
              whyChosen: "Zero white-cast photostable cellular defence against Indian climate UV irradiance",
              applicationNote: "Apply generous two-finger length 15 minutes before UV exposure",
            },
          ],
          pmSteps: [
            {
              order: 1,
              stepType: "CLEANSER",
              productId: "prod-1",
              productName: "Salicylic Acid + LHA 2% Cleanser",
              productBrand: "Minimalist",
              targetIngredients: ["Salicylic Acid", "Zinc PCA"],
              whyChosen: "Solubilizes SPF and environmental particulate debris accumulated through the day",
              applicationNote: "Perform gentle circular massage for 60s",
            },
            {
              order: 2,
              stepType: "TREATMENT",
              productId: "prod-5",
              productName: "15% AHA + 1% BHA Peeling Solution",
              productBrand: "The Derma Co",
              targetIngredients: ["Glycolic Acid 10%", "Lactic Acid 5%", "Salicylic Acid 1%"],
              whyChosen: "Micro-exfoliates dead corneocytes to accelerate dermal cellular turnover",
              applicationNote: "Apply targeted thin film for 10 minutes at night, then rinse thoroughly",
            },
            {
              order: 3,
              stepType: "MOISTURIZER",
              productId: "prod-6",
              productName: "Ceramide & Vitamin C Oil-Free Moisturizer",
              productBrand: "Dr. Sheth's",
              targetIngredients: ["Ceramide Complex", "Vitamin C", "Ashwagandha Extract"],
              whyChosen: "Nighttime lamellar lipid restoration and epidermal hydration seal",
              applicationNote: "Apply liberally as terminal step before rest",
            },
          ],
        });
      } finally {
        setLoading(false);
      }
    }
    fetchRoutine();
  }, []);

  const toggleStep = (stepKey: string) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepKey]: !prev[stepKey],
    }));
  };

  const handleLogAdherence = async () => {
    setAdherenceLogged(true);
    if (!routine) return;
    try {
      const today = new Date().toISOString().split("T")[0]!;
      await apiClient.logAdherence({
        routineId: routine.id,
        date: today,
        amCompleted: activeTab === "AM" || true,
        pmCompleted: activeTab === "PM" || false,
      });
    } catch (e) {
      console.warn("[RoutineScreen] Error logging adherence:", e);
    }
  };

  const currentSteps: RoutineStep[] =
    activeTab === "AM" ? routine?.amSteps || [] : routine?.pmSteps || [];

  const completedCount = currentSteps.filter(
    (s) => completedSteps[`${activeTab}-${s.order}`],
  ).length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandTitle}>REGIMEN GUIDE</Text>
            <Text style={styles.brandSubtitle}>Clinical Skincare Architecture</Text>
          </View>
          <TouchableOpacity
            style={styles.scanBarcodeButton}
            onPress={() => setIsBarcodeModalVisible(true)}
            accessibilityLabel="Scan Product"
          >
            <Barcode size={14} color="#111827" />
            <Text style={styles.scanBarcodeText}>SCAN BARCODE</Text>
          </TouchableOpacity>
        </View>

        {/* Adherence Streak Banner */}
        <View style={styles.streakBanner}>
          <View style={styles.streakInfo}>
            <View style={styles.flameCircle}>
              <Flame size={16} color="#111827" />
            </View>
            <View>
              <Text style={styles.streakTitle}>{streakCount}-DAY ADHERENCE STREAK</Text>
              <Text style={styles.streakSub}>
                Consistent barrier application accelerates concern resolution by 45%
              </Text>
            </View>
          </View>
        </View>

        {/* Phased Regimen Progression & Weekly Schedule */}
        <PhasedRoutineCalendar
          currentPhase={(routine as any)?.treatmentPhase || 1}
          phaseName={(routine as any)?.phaseName || "Phase 1: Baseline Stabilization"}
          phasedPlan={(routine as any)?.phasedPlan}
          calendar={(routine as any)?.calendar}
          barrierLockoutActive={(routine as any)?.barrierLockoutActive}
          barrierLockoutMessage={(routine as any)?.barrierLockoutMessage}
          productConflicts={(routine as any)?.productConflicts}
        />

        {/* Segmented AM / PM Switcher */}
        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "AM" && styles.tabButtonActive]}
            onPress={() => setActiveTab("AM")}
          >
            <Sun size={14} color={activeTab === "AM" ? "#111827" : "#9CA3AF"} />
            <Text style={[styles.tabText, activeTab === "AM" && styles.tabTextActive]}>
              AM PROTOCOL
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === "PM" && styles.tabButtonActive]}
            onPress={() => setActiveTab("PM")}
          >
            <Moon size={14} color={activeTab === "PM" ? "#111827" : "#9CA3AF"} />
            <Text style={[styles.tabText, activeTab === "PM" && styles.tabTextActive]}>
              PM PROTOCOL
            </Text>
          </TouchableOpacity>
        </View>

        {/* Progress Header */}
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>
            STEP COMPLETION: {completedCount} OF {currentSteps.length}
          </Text>
          <Text style={styles.percentText}>
            {currentSteps.length > 0
              ? `${Math.round((completedCount / currentSteps.length) * 100)}% COMPLETED`
              : "0%"}
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color="#111827" style={{ marginVertical: 40 }} />
        ) : (
          <View style={styles.stepsList}>
            {currentSteps.map((step) => {
              const key = `${activeTab}-${step.order}`;
              const isChecked = !!completedSteps[key];
              const stepNumberFormatted = step.order < 10 ? `0${step.order}` : `${step.order}`;

              return (
                <TouchableOpacity
                  key={step.order}
                  style={[styles.stepCard, isChecked && styles.stepCardDone]}
                  onPress={() => toggleStep(key)}
                  activeOpacity={0.7}
                >
                  <View style={styles.stepHeaderRow}>
                    <Text style={styles.stepBadge}>
                      {stepNumberFormatted} {step.stepType}
                    </Text>
                    <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                      {isChecked && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                    </View>
                  </View>

                  <Text style={[styles.productName, isChecked && styles.productNameDone]}>
                    {step.productName}
                  </Text>
                  <Text style={styles.productBrand}>{step.productBrand}</Text>

                  {/* Target Active Ingredients Pills */}
                  {step.targetIngredients && step.targetIngredients.length > 0 && (
                    <View style={styles.ingredientsRow}>
                      {step.targetIngredients.map((ing, idx) => (
                        <View key={idx} style={styles.ingredientPill}>
                          <Text style={styles.ingredientPillText}>{ing}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Clinical Rationale Box */}
                  <View style={styles.whyBox}>
                    <Text style={styles.whyLabel}>CLINICAL FUNCTION</Text>
                    <Text style={styles.whyText}>{step.whyChosen}</Text>
                  </View>

                  {step.applicationNote && (
                    <Text style={styles.appNote}>Application: {step.applicationNote}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Log Completion CTA */}
        <TouchableOpacity
          style={[styles.logButton, adherenceLogged && styles.logButtonDone]}
          onPress={handleLogAdherence}
          disabled={adherenceLogged}
        >
          <Text style={[styles.logButtonText, adherenceLogged && styles.logButtonTextDone]}>
            {adherenceLogged ? "✓ REGIMEN LOGGED FOR TODAY" : "LOG DAILY REGIMEN"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <BarcodeScannerModal
        visible={isBarcodeModalVisible}
        onClose={() => setIsBarcodeModalVisible(false)}
        onProductAdded={(newProd) => {
          if (routine) {
            const newStep: RoutineStep = {
              order: (routine.pmSteps?.length || 0) + 1,
              stepType: newProd.category || "TREATMENT",
              productId: `prod-${Date.now()}`,
              productName: newProd.name,
              productBrand: newProd.brand || "Brand",
              whyChosen: "Scanned & validated via Open Beauty Facts",
              targetIngredients: newProd.ingredients?.slice(0, 3) || [],
            };
            setRoutine({
              ...routine,
              pmSteps: [...(routine.pmSteps || []), newStep],
            });
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: "600",
    color: "#6B7280",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginTop: 2,
  },
  scanBarcodeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 6,
  },
  scanBarcodeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: 1,
  },
  streakBanner: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  streakInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  flameCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  streakTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  streakSub: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
    lineHeight: 16,
  },
  tabSwitcher: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 3,
    marginVertical: 14,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 6,
  },
  tabButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    color: "#6B7280",
    fontWeight: "700",
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  tabTextActive: {
    color: "#111827",
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressText: {
    color: "#6B7280",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  percentText: {
    color: "#111827",
    fontWeight: "800",
    fontSize: 10,
    letterSpacing: 0.8,
  },
  stepsList: {
    gap: 12,
    marginBottom: 20,
  },
  stepCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
  },
  stepCardDone: {
    opacity: 0.7,
  },
  stepHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  stepBadge: {
    fontSize: 10,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  checkboxChecked: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  productName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  productNameDone: {
    textDecorationLine: "line-through",
    color: "#9CA3AF",
  },
  productBrand: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 10,
  },
  ingredientsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 10,
  },
  ingredientPill: {
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  ingredientPillText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#374151",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  whyBox: {
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 8,
  },
  whyLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: "#9CA3AF",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  whyText: {
    color: "#4B5563",
    fontSize: 12,
    lineHeight: 16,
  },
  appNote: {
    fontSize: 11,
    color: "#6B7280",
    fontStyle: "italic",
    marginTop: 2,
  },
  logButton: {
    backgroundColor: "#111827",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 4,
  },
  logButtonDone: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  logButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  logButtonTextDone: {
    color: "#6B7280",
  },
});
