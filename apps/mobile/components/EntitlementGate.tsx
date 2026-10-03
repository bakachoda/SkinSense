import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Lock, Sparkles } from "lucide-react-native";
import { useEntitlements } from "../lib/useEntitlements";
import { PaywallModal } from "./PaywallModal";
import type { EntitlementKey } from "@skinsense/types";

interface EntitlementGateProps {
  requiredEntitlement: EntitlementKey;
  featureName: string;
  children: React.ReactNode;
  fallbackMode?: "inline" | "blur" | "overlay";
}

export function EntitlementGate({
  requiredEntitlement,
  featureName,
  children,
  fallbackMode = "inline",
}: EntitlementGateProps) {
  const { hasEntitlement, loading } = useEntitlements();
  const [showPaywall, setShowPaywall] = useState(false);

  if (loading) {
    return <>{children}</>;
  }

  const isEntitled = hasEntitlement(requiredEntitlement);

  if (isEntitled) {
    return <>{children}</>;
  }

  return (
    <>
      <View style={styles.lockedContainer}>
        <View style={styles.iconCircle}>
          <Lock size={16} color="#0284C7" />
        </View>
        <Text style={styles.lockedTitle}>{featureName}</Text>
        <Text style={styles.lockedSub}>
          This diagnostic feature is reserved for SkinSense Pro members.
        </Text>
        <TouchableOpacity
          style={styles.unlockBtn}
          onPress={() => setShowPaywall(true)}
          activeOpacity={0.8}
        >
          <Sparkles size={14} color="#FFFFFF" />
          <Text style={styles.unlockBtnText}>Unlock with Pro</Text>
        </TouchableOpacity>
      </View>

      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        requiredFeature={featureName}
      />
    </>
  );
}

const styles = StyleSheet.create({
  lockedContainer: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginVertical: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  lockedTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  lockedSub: {
    fontSize: 11,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 16,
    marginBottom: 12,
  },
  unlockBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#0F172A",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  unlockBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
});
