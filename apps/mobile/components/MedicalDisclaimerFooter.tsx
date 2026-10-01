import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { DISCLAIMER_SHORT } from "@skinsense/types";
import { AlertCircle } from "lucide-react-native";

interface Props {
  bottomOffset?: number;
}

export function MedicalDisclaimerFooter({ bottomOffset = 0 }: Props) {
  return (
    <View
      pointerEvents="none"
      style={[styles.container, { bottom: bottomOffset }]}
      accessibilityRole="text"
      accessibilityLabel={DISCLAIMER_SHORT}
    >
      <View style={styles.blurCard}>
        <AlertCircle size={14} color="#94a3b8" style={styles.icon} />
        <Text style={styles.text}>{DISCLAIMER_SHORT}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
    zIndex: 50,
  },
  blurCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.2)",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  icon: {
    marginRight: 8,
    flexShrink: 0,
  },
  text: {
    color: "#94a3b8",
    fontSize: 11,
    lineHeight: 15,
    flex: 1,
    fontWeight: "400",
  },
});
