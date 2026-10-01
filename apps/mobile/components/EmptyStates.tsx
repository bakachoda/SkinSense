import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Sparkles, FilterX, Clock, Camera } from "lucide-react-native";

// ──────────────────────────────────────────────
// 1. No Scans Yet (Home Screen)
// ──────────────────────────────────────────────

interface NoScansEmptyStateProps {
  onTakeScan: () => void;
}

export function NoScansEmptyState({ onTakeScan }: NoScansEmptyStateProps) {
  return (
    <View style={styles.container} accessibilityRole="summary">
      <View style={styles.illustrationWrapper}>
        <Sparkles size={56} color="#06b6d4" />
      </View>
      <Text style={styles.headline}>Your skin journey starts here</Text>
      <Text style={styles.body}>
        Take your first scan to get a personalized skin analysis and routine.
      </Text>
      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={onTakeScan}
        accessibilityLabel="Take My First Scan"
      >
        <Camera size={18} color="#0f172a" style={{ marginRight: 8 }} />
        <Text style={styles.primaryBtnText}>Take My First Scan</Text>
      </TouchableOpacity>
    </View>
  );
}

// ──────────────────────────────────────────────
// 2. No Products Match Filters
// ──────────────────────────────────────────────

interface NoProductsEmptyStateProps {
  onResetFilters: () => void;
}

export function NoProductsEmptyState({ onResetFilters }: NoProductsEmptyStateProps) {
  return (
    <View style={styles.container} accessibilityRole="summary">
      <View style={[styles.illustrationWrapper, { backgroundColor: "rgba(244, 63, 94, 0.1)", borderColor: "rgba(244, 63, 94, 0.3)" }]}>
        <FilterX size={44} color="#f43f5e" />
      </View>
      <Text style={styles.headline}>No products found</Text>
      <Text style={styles.body}>
        Try adjusting your filters to see more results.
      </Text>
      <TouchableOpacity
        style={styles.secondaryBtn}
        onPress={onResetFilters}
        accessibilityLabel="Reset Filters"
      >
        <Text style={styles.secondaryBtnText}>Reset Filters</Text>
      </TouchableOpacity>
    </View>
  );
}

// ──────────────────────────────────────────────
// 3. No Progress Data Yet
// ──────────────────────────────────────────────

export function NoProgressEmptyState() {
  return (
    <View style={styles.container} accessibilityRole="summary">
      <View style={[styles.illustrationWrapper, { backgroundColor: "rgba(168, 85, 247, 0.1)", borderColor: "rgba(168, 85, 247, 0.3)" }]}>
        <Clock size={44} color="#a855f7" />
      </View>
      <Text style={styles.headline}>Not enough data yet</Text>
      <Text style={styles.body}>
        Scan again in 2 weeks to start tracking your skin&apos;s progress over time.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    marginVertical: 40,
  },
  illustrationWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(6, 182, 212, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  headline: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  body: {
    color: "#94a3b8",
    fontSize: 14,
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 20,
    marginBottom: 24,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#06b6d4",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  primaryBtnText: {
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryBtn: {
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  secondaryBtnText: {
    color: "#38bdf8",
    fontSize: 14,
    fontWeight: "600",
  },
});
