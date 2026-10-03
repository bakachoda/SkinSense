import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { CloudSnow, Sun, Wind, ChevronRight, X, Sparkles } from "lucide-react-native";

interface SeasonalAdjustmentBannerProps {
  onDismiss?: () => void;
  onApplyAdjustment?: () => void;
}

export function SeasonalAdjustmentBanner({
  onDismiss,
  onApplyAdjustment,
}: SeasonalAdjustmentBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    if (onDismiss) onDismiss();
  };

  return (
    <View style={styles.banner}>
      <View style={styles.topRow}>
        <View style={styles.iconCircle}>
          <CloudSnow size={18} color="#38BDF8" />
        </View>
        <View style={styles.titleWrap}>
          <Text style={styles.badge}>SEASONAL SHIFT DETECTED</Text>
          <Text style={styles.title}>Winter Dryness Approaching</Text>
        </View>
        <TouchableOpacity onPress={handleDismiss} style={styles.closeBtn}>
          <X size={16} color="#64748B" />
        </TouchableOpacity>
      </View>

      <Text style={styles.body}>
        Forecast shows a 25% drop in ambient humidity next week. Prevent barrier dehydration by buffering acids and upgrading to a ceramide-rich moisturizer.
      </Text>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onApplyAdjustment}
        >
          <Sparkles size={14} color="#FFFFFF" />
          <Text style={styles.actionBtnText}>Auto-Adjust Routine</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: "#0F172A",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#38BDF840",
    marginBottom: 16,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#38BDF820",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  titleWrap: {
    flex: 1,
  },
  badge: {
    fontSize: 9,
    fontWeight: "800",
    color: "#38BDF8",
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F8FAFC",
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    fontSize: 12,
    color: "#94A3B8",
    lineHeight: 17,
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#0284C7",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
});
