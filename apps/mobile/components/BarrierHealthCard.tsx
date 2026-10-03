import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle, Lock, CheckCircle2 } from "lucide-react-native";
import type { BarrierHealthResult } from "@skinsense/types";

interface BarrierHealthCardProps {
  barrierResult?: BarrierHealthResult | null;
  barrierScore?: number;
}

export function BarrierHealthCard({ barrierResult, barrierScore }: BarrierHealthCardProps) {
  const score = barrierResult?.score ?? barrierScore ?? 78;
  const isLockedOut = barrierResult?.isLockedOut ?? (score < 40);
  const status = barrierResult?.status ?? (score >= 75 ? "OPTIMAL" : score >= 60 ? "HEALTHY" : score >= 40 ? "VULNERABLE" : "COMPROMISED");

  const getStatusColor = () => {
    switch (status) {
      case "OPTIMAL":
        return "#10B981";
      case "HEALTHY":
        return "#06B6D4";
      case "VULNERABLE":
        return "#F59E0B";
      case "COMPROMISED":
      default:
        return "#EF4444";
    }
  };

  const statusColor = getStatusColor();

  return (
    <View style={styles.cardContainer}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleBadge}>
          {isLockedOut ? (
            <ShieldAlert size={18} color="#EF4444" />
          ) : (
            <ShieldCheck size={18} color="#10B981" />
          )}
          <Text style={styles.cardTitle}>Stratum Corneum Barrier Health</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: `${statusColor}20`, borderColor: `${statusColor}50` }]}>
          <Text style={[styles.statusPillText, { color: statusColor }]}>{status}</Text>
        </View>
      </View>

      {/* Score Gauge & Breakdown */}
      <View style={styles.scoreRow}>
        <View style={styles.scoreMetric}>
          <Text style={[styles.scoreValue, { color: statusColor }]}>{score}</Text>
          <Text style={styles.scoreMax}>/ 100</Text>
        </View>
        <View style={styles.scoreBarTrack}>
          <View
            style={[
              styles.scoreBarFill,
              {
                width: `${score}%`,
                backgroundColor: statusColor,
              },
            ]}
          />
        </View>
      </View>

      {/* Lockout Gatekeeping Banner */}
      {isLockedOut ? (
        <View style={styles.lockoutBanner}>
          <View style={styles.lockoutHeader}>
            <Lock size={16} color="#F87171" />
            <Text style={styles.lockoutTitle}>BARRIER LOCKOUT ACTIVATED</Text>
          </View>
          <Text style={styles.lockoutMessage}>
            {barrierResult?.lockoutReason ||
              "Stratum corneum lipid barrier compromised (Score < 40). Potent exfoliating acids and retinoids are strictly suspended until cellular integrity is restored."}
          </Text>
          <View style={styles.hysteresisRow}>
            <AlertTriangle size={14} color="#FBBF24" />
            <Text style={styles.hysteresisText}>
              Requires 2 consecutive scans ≥ 60 to safely unlock potent actives. (Current: {barrierResult?.consecutiveHealthyScans || 0}/2)
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.healthyBanner}>
          <CheckCircle2 size={16} color="#34D399" />
          <Text style={styles.healthyText}>
            Lipid matrix intact. Full active ingredient tolerance unlocked.
          </Text>
        </View>
      )}

      {/* Allowed vs Restricted Ingredients */}
      {isLockedOut && barrierResult?.restrictedIngredients && barrierResult.restrictedIngredients.length > 0 && (
        <View style={styles.restrictionsSection}>
          <Text style={styles.sectionSubtitle}>Suspended Actives (Auto-Gated):</Text>
          <View style={styles.chipRow}>
            {barrierResult.restrictedIngredients.map((item, idx) => (
              <View key={idx} style={styles.restrictedChip}>
                <Text style={styles.restrictedChipText}>✕ {item}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#131B2E",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1E293B",
    marginTop: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  titleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F8FAFC",
    letterSpacing: 0.2,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  scoreRow: {
    marginBottom: 14,
  },
  scoreMetric: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 6,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: "800",
  },
  scoreMax: {
    fontSize: 13,
    color: "#64748B",
    marginLeft: 4,
    fontWeight: "600",
  },
  scoreBarTrack: {
    height: 8,
    backgroundColor: "#1E293B",
    borderRadius: 999,
    overflow: "hidden",
  },
  scoreBarFill: {
    height: "100%",
    borderRadius: 999,
  },
  lockoutBanner: {
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.35)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
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
  lockoutMessage: {
    fontSize: 12,
    color: "#FCA5A5",
    lineHeight: 18,
    marginBottom: 8,
  },
  hysteresisRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    padding: 8,
    borderRadius: 8,
  },
  hysteresisText: {
    fontSize: 11,
    color: "#FCD34D",
    flex: 1,
    lineHeight: 15,
  },
  healthyBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.25)",
    padding: 10,
    borderRadius: 10,
  },
  healthyText: {
    fontSize: 12,
    color: "#6EE7B7",
    fontWeight: "500",
    flex: 1,
  },
  restrictionsSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
  },
  sectionSubtitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  restrictedChip: {
    backgroundColor: "rgba(239, 68, 68, 0.18)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  restrictedChipText: {
    fontSize: 11,
    color: "#FCA5A5",
    fontWeight: "600",
  },
});
