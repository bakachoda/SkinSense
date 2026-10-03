import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Calendar, Shield, Sparkles, AlertTriangle, Layers, Clock, CheckCircle } from "lucide-react-native";
import type { PhasedIntroductionPlan, RoutineCalendar, TreatmentPhase } from "@skinsense/types";

interface PhasedRoutineCalendarProps {
  currentPhase?: TreatmentPhase;
  phaseName?: string;
  phasedPlan?: PhasedIntroductionPlan | null;
  calendar?: RoutineCalendar | null;
  barrierLockoutActive?: boolean;
  barrierLockoutMessage?: string;
  productConflicts?: { product1: string; product2: string; reason: string }[];
}

export function PhasedRoutineCalendar({
  currentPhase = 1,
  phaseName = "Phase 1: Baseline Stabilization",
  phasedPlan,
  calendar,
  barrierLockoutActive = false,
  barrierLockoutMessage,
  productConflicts = [],
}: PhasedRoutineCalendarProps) {
  const daysOfWeek = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const dayLabels: Record<string, string> = {
    mon: "Mon",
    tue: "Tue",
    wed: "Wed",
    thu: "Thu",
    fri: "Fri",
    sat: "Sat",
    sun: "Sun",
  };

  const defaultCalendar: Record<string, { amFocus: string; pmFocus: string; isActiveNight: boolean }> = {
    mon: { amFocus: "Hydrate & Protect", pmFocus: "Barrier Recovery", isActiveNight: false },
    tue: { amFocus: "Antioxidant Defence", pmFocus: "Targeted Retinoid", isActiveNight: true },
    wed: { amFocus: "Hydrate & Protect", pmFocus: "Barrier Recovery", isActiveNight: false },
    thu: { amFocus: "Antioxidant Defence", pmFocus: "BHA Exfoliation", isActiveNight: true },
    fri: { amFocus: "Hydrate & Protect", pmFocus: "Barrier Recovery", isActiveNight: false },
    sat: { amFocus: "Antioxidant Defence", pmFocus: "Targeted Retinoid", isActiveNight: true },
    sun: { amFocus: "Deep Hydration", pmFocus: "Rest & Barrier Reset", isActiveNight: false },
  };

  const activeCalendar = (calendar as any)?.days || defaultCalendar;

  return (
    <View style={styles.container}>
      {/* Barrier Lockout Gatekeeping Banner */}
      {barrierLockoutActive && (
        <View style={styles.lockoutCard}>
          <View style={styles.lockoutHeader}>
            <Shield size={16} color="#EF4444" />
            <Text style={styles.lockoutTitle}>BARRIER LOCKOUT ACTIVATED</Text>
          </View>
          <Text style={styles.lockoutDesc}>
            {barrierLockoutMessage ||
              "Stratum corneum lipid barrier compromised (Score < 40). Regimen has been automatically switched to the soothing Ceramide Barrier Repair Protocol."}
          </Text>
        </View>
      )}

      {/* 4-Phase Ramp Progress Tracker */}
      <View style={styles.phasesCard}>
        <View style={styles.phaseHeaderRow}>
          <View style={styles.titleBadge}>
            <Layers size={14} color="#111827" />
            <Text style={styles.sectionTitle}>4-Phase Regimen Progression</Text>
          </View>
          <View style={styles.phasePill}>
            <Text style={styles.phasePillText}>PHASE {currentPhase} OF 4</Text>
          </View>
        </View>

        <Text style={styles.phaseNameText}>{phaseName}</Text>

        <View style={styles.phaseStepsTrack}>
          {[1, 2, 3, 4].map((p) => {
            const isCompleted = p < currentPhase;
            const isCurrent = p === currentPhase;

            return (
              <View key={p} style={styles.phaseStepNode}>
                <View
                  style={[
                    styles.nodeCircle,
                    isCompleted && styles.nodeCircleCompleted,
                    isCurrent && styles.nodeCircleCurrent,
                  ]}
                >
                  {isCompleted ? (
                    <CheckCircle size={14} color="#FFFFFF" />
                  ) : (
                    <Text
                      style={[
                        styles.nodeNumber,
                        isCurrent && styles.nodeNumberCurrent,
                      ]}
                    >
                      {p}
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.nodeLabel,
                    isCurrent && styles.nodeLabelCurrent,
                  ]}
                >
                  {p === 1 ? "Baseline" : p === 2 ? "Intro" : p === 3 ? "Therapeutic" : "Maintain"}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* 7-Day Weekly Alternating Routine Calendar */}
      <View style={styles.calendarCard}>
        <View style={styles.calendarHeaderRow}>
          <View style={styles.titleBadge}>
            <Calendar size={14} color="#111827" />
            <Text style={styles.sectionTitle}>Weekly Application Schedule</Text>
          </View>
          <Text style={styles.legendText}>Active / Recovery Protocol</Text>
        </View>

        <View style={styles.weekGrid}>
          {daysOfWeek.map((dayKey) => {
            const dayData = activeCalendar[dayKey] || defaultCalendar[dayKey]!;
            const isActive = dayData.isActiveNight;

            return (
              <View
                key={dayKey}
                style={[
                  styles.dayColumn,
                  isActive && styles.dayColumnActive,
                ]}
              >
                <Text style={styles.dayLabel}>{dayLabels[dayKey]}</Text>
                <View
                  style={[
                    styles.nightTag,
                    {
                      backgroundColor: isActive ? "#111827" : "#F3F4F6",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.nightTagText,
                      { color: isActive ? "#FFFFFF" : "#6B7280" },
                    ]}
                  >
                    {isActive ? "Active" : "Reset"}
                  </Text>
                </View>
                <Text style={styles.dayFocus} numberOfLines={2}>
                  {dayData.pmFocus}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Routine Synergy & Conflict Alerts */}
      {productConflicts.length > 0 && (
        <View style={styles.conflictCard}>
          <View style={styles.conflictHeader}>
            <AlertTriangle size={15} color="#F59E0B" />
            <Text style={styles.conflictTitle}>Ingredient Interaction Warning</Text>
          </View>
          {productConflicts.map((c, idx) => (
            <View key={idx} style={styles.conflictItem}>
              <Text style={styles.conflictPair}>
                {c.product1} ✕ {c.product2}
              </Text>
              <Text style={styles.conflictReason}>{c.reason}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    gap: 12,
  },
  lockoutCard: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 8,
    padding: 14,
  },
  lockoutHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  lockoutTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#DC2626",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  lockoutDesc: {
    fontSize: 12,
    color: "#991B1B",
    lineHeight: 18,
  },
  phasesCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  phaseHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  titleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  phasePill: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  phasePillText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#374151",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  phaseNameText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 16,
  },
  phaseStepsTrack: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  phaseStepNode: {
    alignItems: "center",
    flex: 1,
  },
  nodeCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  nodeCircleCompleted: {
    borderColor: "#111827",
    backgroundColor: "#111827",
  },
  nodeCircleCurrent: {
    borderColor: "#111827",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
  },
  nodeNumber: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6B7280",
  },
  nodeNumberCurrent: {
    color: "#111827",
  },
  nodeLabel: {
    fontSize: 9,
    color: "#6B7280",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  nodeLabelCurrent: {
    color: "#111827",
    fontWeight: "800",
  },
  calendarCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  calendarHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  legendText: {
    fontSize: 9,
    color: "#6B7280",
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  weekGrid: {
    flexDirection: "row",
    gap: 4,
  },
  dayColumn: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 2,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  dayColumnActive: {
    borderColor: "#111827",
    backgroundColor: "#FFFFFF",
  },
  dayLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#374151",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  nightTag: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  nightTagText: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  dayFocus: {
    fontSize: 8,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 11,
    paddingHorizontal: 2,
  },
  conflictCard: {
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 8,
    padding: 12,
  },
  conflictHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  conflictTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#B45309",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  conflictItem: {
    marginTop: 4,
  },
  conflictPair: {
    fontSize: 11,
    fontWeight: "700",
    color: "#92400E",
  },
  conflictReason: {
    fontSize: 11,
    color: "#78350F",
    lineHeight: 15,
  },
});
