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
            <Layers size={16} color="#06B6D4" />
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
                    <CheckCircle size={14} color="#10B981" />
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
            <Calendar size={16} color="#A855F7" />
            <Text style={styles.sectionTitle}>Weekly Application Schedule</Text>
          </View>
          <Text style={styles.legendText}>Alternating Active / Recovery</Text>
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
                      backgroundColor: isActive
                        ? "rgba(168, 85, 247, 0.2)"
                        : "rgba(16, 185, 129, 0.15)",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.nightTagText,
                      { color: isActive ? "#C084FC" : "#34D399" },
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
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.35)",
    borderRadius: 14,
    padding: 14,
  },
  lockoutHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  lockoutTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#F87171",
    letterSpacing: 0.5,
  },
  lockoutDesc: {
    fontSize: 12,
    color: "#FCA5A5",
    lineHeight: 17,
  },
  phasesCard: {
    backgroundColor: "#131B2E",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1E293B",
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
    fontSize: 14,
    fontWeight: "700",
    color: "#F8FAFC",
  },
  phasePill: {
    backgroundColor: "rgba(6, 182, 212, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.3)",
  },
  phasePillText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#22D3EE",
  },
  phaseNameText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#94A3B8",
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
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#0B111E",
    borderWidth: 1,
    borderColor: "#334155",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  nodeCircleCompleted: {
    borderColor: "#10B981",
    backgroundColor: "rgba(16, 185, 129, 0.15)",
  },
  nodeCircleCurrent: {
    borderColor: "#06B6D4",
    backgroundColor: "rgba(6, 182, 212, 0.2)",
    borderWidth: 2,
  },
  nodeNumber: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
  },
  nodeNumberCurrent: {
    color: "#22D3EE",
  },
  nodeLabel: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "600",
  },
  nodeLabelCurrent: {
    color: "#F8FAFC",
    fontWeight: "700",
  },
  calendarCard: {
    backgroundColor: "#131B2E",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  calendarHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  legendText: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "600",
  },
  weekGrid: {
    flexDirection: "row",
    gap: 4,
  },
  dayColumn: {
    flex: 1,
    backgroundColor: "#0B111E",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 2,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  dayColumnActive: {
    borderColor: "rgba(168, 85, 247, 0.4)",
    backgroundColor: "rgba(168, 85, 247, 0.05)",
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94A3B8",
    marginBottom: 4,
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
  },
  dayFocus: {
    fontSize: 8,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 10,
  },
  conflictCard: {
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
    borderRadius: 12,
    padding: 12,
  },
  conflictHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  conflictTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FBBF24",
  },
  conflictItem: {
    marginTop: 4,
  },
  conflictPair: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FDE68A",
  },
  conflictReason: {
    fontSize: 11,
    color: "#D97706",
  },
});
