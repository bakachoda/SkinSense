import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Baby, Shield, Sparkles, Check, AlertCircle } from "lucide-react-native";
import { PREGNANCY_SAFE, PREGNANCY_BANNED, LifeStage } from "@skinsense/types";

interface LifeStageCardProps {
  currentStage?: LifeStage;
  onSelectStage?: (stage: LifeStage) => void;
}

export function LifeStageCard({
  currentStage = "NONE",
  onSelectStage,
}: LifeStageCardProps) {
  const [stage, setStage] = useState<LifeStage>(currentStage);

  const handleSelect = (s: LifeStage) => {
    setStage(s);
    if (onSelectStage) onSelectStage(s);
  };

  const isPregnancy = stage === "PREGNANCY";

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <Baby size={18} color="#F472B6" />
          </View>
          <View>
            <Text style={styles.title}>Life-Stage Skincare Adaptation</Text>
            <Text style={styles.subTitle}>Hormonal & Obstetric Guardrails</Text>
          </View>
        </View>
      </View>

      {/* Selector Tabs */}
      <View style={styles.tabsRow}>
        {(["NONE", "PREGNANCY", "POSTPARTUM", "PERIMENOPAUSE", "PUBERTY"] as LifeStage[]).map(
          (s) => {
            const isSelected = stage === s;
            const label =
              s === "NONE"
                ? "Standard"
                : s === "PREGNANCY"
                  ? "Pregnancy"
                  : s === "POSTPARTUM"
                    ? "Postpartum"
                    : s === "PERIMENOPAUSE"
                      ? "Menopause"
                      : "Puberty";

            return (
              <TouchableOpacity
                key={s}
                style={[styles.tab, isSelected && styles.tabSelected]}
                onPress={() => handleSelect(s)}
              >
                <Text style={[styles.tabText, isSelected && styles.tabTextSelected]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          },
        )}
      </View>

      {/* Dynamic Content */}
      {isPregnancy ? (
        <View style={styles.pregnancyContent}>
          <View style={styles.alertBanner}>
            <Shield size={16} color="#EC4899" />
            <Text style={styles.alertText}>
              Obstetric Active Lock Engaged: All retinoids, high salicylic acid, and chemical SPFs are filtered from your routine recommendations.
            </Text>
          </View>

          <Text style={styles.listTitle}>SAFE ALTERNATIVES RECOMMENDED</Text>
          <View style={styles.pillWrap}>
            {PREGNANCY_SAFE.slice(0, 6).map((item) => (
              <View key={item} style={styles.safePill}>
                <Check size={12} color="#10B981" />
                <Text style={styles.safePillText}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={styles.melasmaNotice}>
            <AlertCircle size={14} color="#F59E0B" />
            <Text style={styles.melasmaText}>
              Bilateral cheek/forehead pigmentation classified as hormonal melasma. Safe brightening agents (Azelaic Acid 10%) prioritized.
            </Text>
          </View>
        </View>
      ) : stage === "PERIMENOPAUSE" ? (
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Lipid Replenishment & Collagen Support</Text>
          <Text style={styles.infoSub}>
            Prioritizing multi-ceramide barrier creams and signal peptides (Matrixyl 3000) to compensate for hormonal estrogenic sebum reduction.
          </Text>
        </View>
      ) : stage === "PUBERTY" ? (
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Essential 3-Step Non-Stripping Routine</Text>
          <Text style={styles.infoSub}>
            Gentle salicylic acid (0.5%) and light hydration. Strict avoidance of aggressive multi-acid layering to protect adolescent skin barrier.
          </Text>
        </View>
      ) : (
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Standard Adult Formulation</Text>
          <Text style={styles.infoSub}>
            Full access to dermatological actives calibrated to your measured skin barrier tolerance.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F472B620",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F8FAFC",
  },
  subTitle: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1,
  },
  tabsRow: {
    flexDirection: "row",
    backgroundColor: "#0F172A",
    borderRadius: 10,
    padding: 4,
    gap: 4,
    marginBottom: 14,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  tabSelected: {
    backgroundColor: "#1E293B",
  },
  tabText: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
  tabTextSelected: {
    color: "#38BDF8",
    fontWeight: "700",
  },
  pregnancyContent: {
    marginTop: 2,
  },
  alertBanner: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#EC489915",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EC489930",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  alertText: {
    flex: 1,
    fontSize: 11,
    color: "#F472B6",
    lineHeight: 16,
  },
  listTitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  pillWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  safePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#10B98115",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#10B98130",
  },
  safePillText: {
    fontSize: 11,
    color: "#34D399",
    fontWeight: "600",
  },
  melasmaNotice: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#F59E0B10",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  melasmaText: {
    flex: 1,
    fontSize: 11,
    color: "#FCD34D",
    lineHeight: 15,
  },
  infoContent: {
    backgroundColor: "#0F172A",
    borderRadius: 10,
    padding: 12,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#F8FAFC",
    marginBottom: 4,
  },
  infoSub: {
    fontSize: 11,
    color: "#94A3B8",
    lineHeight: 16,
  },
});
