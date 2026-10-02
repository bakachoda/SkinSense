import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { apiClient } from "../../lib/api-client";
import type { Routine, RoutineStep } from "@skinsense/types";
import {
  Sun,
  Moon,
  CheckCircle2,
  Circle,
  Flame,
  Sparkles,
  Award,
} from "lucide-react-native";

export default function RoutineScreen() {
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"AM" | "PM">("AM");
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [adherenceLogged, setAdherenceLogged] = useState<boolean>(false);
  const [streakCount] = useState<number>(7);

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
              productName: "Foaming Facial Cleanser",
              productBrand: "CeraVe",
              targetIngredients: ["Ceramides", "Niacinamide"],
              whyChosen: "Cleanses excess oil without stripping barrier",
              applicationNote: "Wash for 60 seconds with lukewarm water",
            },
            {
              order: 2,
              stepType: "SERUM",
              productId: "prod-2",
              productName: "Niacinamide 10% + Zinc 1%",
              productBrand: "The Ordinary",
              targetIngredients: ["Niacinamide", "Zinc PCA"],
              whyChosen: "Regulates sebum production and targets inflammatory blemishes",
              applicationNote: "Apply 3-4 drops across entire face",
            },
            {
              order: 3,
              stepType: "MOISTURIZER",
              productId: "prod-3",
              productName: "Hydro Boost Water Gel",
              productBrand: "Neutrogena",
              targetIngredients: ["Hyaluronic Acid"],
              whyChosen: "Oil-free gel hydration balanced for combination zones",
              applicationNote: "Smooth evenly over face and neck",
            },
            {
              order: 4,
              stepType: "SPF",
              productId: "prod-4",
              productName: "Anthelios Clear Skin Dry Touch SPF 60",
              productBrand: "La Roche-Posay",
              targetIngredients: ["Silica", "Perlite"],
              whyChosen: "Matte photoprotection that will not clog pores",
              applicationNote: "Apply generously 15 minutes before sun exposure",
            },
          ],
          pmSteps: [
            {
              order: 1,
              stepType: "CLEANSER",
              productId: "prod-1",
              productName: "Foaming Facial Cleanser",
              productBrand: "CeraVe",
              targetIngredients: ["Ceramides", "Niacinamide"],
              whyChosen: "Removes SPF and daily pollutants",
              applicationNote: "Double cleanse if wearing makeup",
            },
            {
              order: 2,
              stepType: "TREATMENT",
              productId: "prod-5",
              productName: "Salicylic Acid 2% Solution",
              productBrand: "The Ordinary",
              targetIngredients: ["Salicylic Acid"],
              whyChosen: "Clears pores and papules overnight",
              applicationNote: "Apply thin layer to T-zone and blemishes",
            },
            {
              order: 3,
              stepType: "MOISTURIZER",
              productId: "prod-6",
              productName: "PM Facial Moisturizing Lotion",
              productBrand: "CeraVe",
              targetIngredients: ["Ceramides", "Niacinamide"],
              whyChosen: "Deep nighttime barrier repair",
              applicationNote: "Apply liberally before bed",
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
    console.log("[RoutineScreen] handleLogAdherence triggered! routine:", routine?.id);
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
          <Text style={styles.title}>Daily Regimen</Text>
          <Text style={styles.subtitle}>
            Track your AM & PM clinical applications
          </Text>
        </View>

        {/* Streak & Adherence Tracker Banner */}
        <View style={styles.streakBanner}>
          <View style={styles.flameCircle}>
            <Flame size={24} color="#F59E0B" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.streakTitle}>{streakCount} Days Adherence Streak!</Text>
            <Text style={styles.streakSub}>
              Consistent barrier support leads to 45% faster concern clearance
            </Text>
          </View>
          <Award size={24} color="#10B981" />
        </View>

        {/* Tab Switcher: AM vs PM */}
        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "AM" && styles.tabButtonActive]}
            onPress={() => setActiveTab("AM")}
          >
            <Sun size={18} color={activeTab === "AM" ? "#F59E0B" : "#9CA3AF"} />
            <Text style={[styles.tabText, activeTab === "AM" && styles.tabTextActive]}>
              Morning (AM)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === "PM" && styles.tabButtonActive]}
            onPress={() => setActiveTab("PM")}
          >
            <Moon size={18} color={activeTab === "PM" ? "#818CF8" : "#9CA3AF"} />
            <Text style={[styles.tabText, activeTab === "PM" && styles.tabTextActive]}>
              Evening (PM)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Progress Header */}
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>
            {completedCount} of {currentSteps.length} steps completed
          </Text>
          <Text style={styles.percentText}>
            {currentSteps.length > 0
              ? `${Math.round((completedCount / currentSteps.length) * 100)}%`
              : "0%"}
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#10B981" style={{ marginVertical: 40 }} />
        ) : (
          <View style={styles.stepsList}>
            {currentSteps.map((step) => {
              const key = `${activeTab}-${step.order}`;
              const isChecked = !!completedSteps[key];

              return (
                <TouchableOpacity
                  key={step.order}
                  style={[styles.stepCard, isChecked && styles.stepCardDone]}
                  onPress={() => toggleStep(key)}
                  activeOpacity={0.7}
                >
                  <View style={styles.checkboxTouch}>
                    {isChecked ? (
                      <CheckCircle2 size={24} color="#10B981" />
                    ) : (
                      <Circle size={24} color="#4B5563" />
                    )}
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={styles.stepBadgeRow}>
                      <Text style={styles.stepOrderBadge}>STEP {step.order}</Text>
                      <Text style={styles.stepTypeBadge}>{step.stepType}</Text>
                    </View>

                    <Text style={[styles.productName, isChecked && styles.productNameDone]}>
                      {step.productName}
                    </Text>
                    <Text style={styles.productBrand}>{step.productBrand}</Text>

                    <View style={styles.whyBox}>
                      <Sparkles size={12} color="#10B981" />
                      <Text style={styles.whyText}>{step.whyChosen}</Text>
                    </View>

                    {step.applicationNote && (
                      <Text style={styles.appNote}>{step.applicationNote}</Text>
                    )}
                  </View>
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
          <Text style={styles.logButtonText}>
            {adherenceLogged ? "✓ Regimen Logged for Today" : "Log Today's Regimen"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0F17",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#F9FAFB",
  },
  subtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 4,
  },
  streakBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161E2E",
    borderWidth: 1,
    borderColor: "#F59E0B",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 20,
  },
  flameCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  streakTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#F59E0B",
  },
  streakSub: {
    fontSize: 12,
    color: "#D1D5DB",
    marginTop: 2,
    lineHeight: 16,
  },
  tabSwitcher: {
    flexDirection: "row",
    backgroundColor: "#161E2E",
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: "#1F2937",
  },
  tabText: {
    color: "#9CA3AF",
    fontWeight: "600",
    fontSize: 14,
  },
  tabTextActive: {
    color: "#F9FAFB",
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  progressText: {
    color: "#9CA3AF",
    fontSize: 13,
  },
  percentText: {
    color: "#10B981",
    fontWeight: "700",
    fontSize: 13,
  },
  stepsList: {
    gap: 12,
    marginBottom: 24,
  },
  stepCard: {
    flexDirection: "row",
    backgroundColor: "#161E2E",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1F2937",
    padding: 16,
    gap: 14,
  },
  stepCardDone: {
    borderColor: "#10B981",
    backgroundColor: "#0F281E",
  },
  checkboxTouch: {
    paddingTop: 2,
  },
  stepBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  stepOrderBadge: {
    color: "#3B82F6",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  stepTypeBadge: {
    color: "#9CA3AF",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  productName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F3F4F6",
  },
  productNameDone: {
    textDecorationLine: "line-through",
    color: "#9CA3AF",
  },
  productBrand: {
    fontSize: 13,
    color: "#9CA3AF",
    marginBottom: 8,
  },
  whyBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    padding: 8,
    borderRadius: 8,
    marginBottom: 6,
  },
  whyText: {
    flex: 1,
    color: "#6EE7B7",
    fontSize: 12,
    lineHeight: 16,
  },
  appNote: {
    fontSize: 12,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  logButton: {
    backgroundColor: "#10B981",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
  },
  logButtonDone: {
    backgroundColor: "#065F46",
  },
  logButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
