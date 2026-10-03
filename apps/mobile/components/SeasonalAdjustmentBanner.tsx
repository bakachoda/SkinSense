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
          <CloudSnow size={16} color="#18181B" />
        </View>
        <View style={styles.titleWrap}>
          <Text style={styles.badge}>ENVIRONMENTAL TELEMETRY</Text>
          <Text style={styles.title}>Seasonal Shift: Humidity Drop (-25%)</Text>
        </View>
        <TouchableOpacity onPress={handleDismiss} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <X size={15} color="#A1A1AA" />
        </TouchableOpacity>
      </View>

      <Text style={styles.body}>
        Ambient humidity drops next week. Buffer active acids and transition toward a lipid-replenishing ceramide barrier cream.
      </Text>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onApplyAdjustment}
          activeOpacity={0.85}
        >
          <Text style={styles.actionBtnText}>Update Regimen</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E4E4E7",
    marginBottom: 16,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: "#F4F4F5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  titleWrap: {
    flex: 1,
  },
  badge: {
    fontSize: 9,
    fontWeight: "700",
    color: "#71717A",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    color: "#18181B",
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    fontSize: 12,
    color: "#52525B",
    lineHeight: 18,
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: "row",
  },
  actionBtn: {
    backgroundColor: "#18181B",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});

