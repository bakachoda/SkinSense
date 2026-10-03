import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from "react-native";
import {
  X,
  Check,
  Sparkles,
  ShieldCheck,
  Zap,
  Layers,
  FileText,
  Users,
  Volume2,
} from "lucide-react-native";
import { useEntitlements } from "../lib/useEntitlements";
import type { SubscriptionTier } from "@skinsense/types";

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  requiredFeature?: string;
  onSuccess?: () => void;
}

export function PaywallModal({
  visible,
  onClose,
  requiredFeature,
  onSuccess,
}: PaywallModalProps) {
  console.log("[SkinSense] PaywallModal visible =", visible);
  const { plans, tier: currentTier, upgrade, restore, isUpgrading } = useEntitlements();
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>("PRO_ANNUAL");

  const handleSubscribe = async () => {
    const res = await upgrade(selectedTier, "SANDBOX_TEST");
    if (res.success) {
      Alert.alert(
        "Subscription Activated",
        `You have successfully unlocked SkinSense ${selectedTier.replace("_", " ")}!`,
        [
          {
            text: "Continue",
            onPress: () => {
              if (onSuccess) onSuccess();
              onClose();
            },
          },
        ],
      );
    } else {
      Alert.alert("Upgrade Error", res.error || "Failed to process upgrade.");
    }
  };

  const handleRestore = async () => {
    const res = await restore();
    if (res.success) {
      Alert.alert("Purchases Restored", res.message, [{ text: "OK", onPress: onClose }]);
    } else {
      Alert.alert("Restore Notice", res.error || "No active subscriptions found.");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <X size={22} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerKicker}>CLINICAL ACCESS</Text>
          <View style={{ width: 22 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Hero Banner */}
          <View style={styles.heroBox}>
            <View style={styles.iconCircle}>
              <Sparkles size={24} color="#0284C7" />
            </View>
            <Text style={styles.heroTitle}>Upgrade to SkinSense Pro</Text>
            <Text style={styles.heroSub}>
              {requiredFeature
                ? `Unlock ${requiredFeature} and complete diagnostic-grade intelligence.`
                : "Full multi-spectral analysis, unlimited scans, and physician exports."}
            </Text>

            {/* Trial Banner */}
            <View style={styles.trialPill}>
              <ShieldCheck size={14} color="#059669" />
              <Text style={styles.trialPillText}>7-DAY FREE TRIAL • CANCEL ANYTIME</Text>
            </View>
          </View>

          {/* Pricing Options */}
          <View style={styles.plansContainer}>
            {/* Pro Annual */}
            <TouchableOpacity
              style={[
                styles.planCard,
                selectedTier === "PRO_ANNUAL" && styles.planCardSelected,
              ]}
              onPress={() => setSelectedTier("PRO_ANNUAL")}
              activeOpacity={0.85}
            >
              <View style={styles.planCardHeader}>
                <View style={styles.radioOuter}>
                  {selectedTier === "PRO_ANNUAL" && <View style={styles.radioInner} />}
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.planTitleRow}>
                    <Text style={styles.planName}>Pro Annual</Text>
                    <View style={styles.saveBadge}>
                      <Text style={styles.saveBadgeText}>SAVE 33%</Text>
                    </View>
                  </View>
                  <Text style={styles.planSub}>$6.67/mo (Billed $79.99/year)</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Pro Monthly */}
            <TouchableOpacity
              style={[
                styles.planCard,
                selectedTier === "PRO_MONTHLY" && styles.planCardSelected,
              ]}
              onPress={() => setSelectedTier("PRO_MONTHLY")}
              activeOpacity={0.85}
            >
              <View style={styles.planCardHeader}>
                <View style={styles.radioOuter}>
                  {selectedTier === "PRO_MONTHLY" && <View style={styles.radioInner} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.planName}>Pro Monthly</Text>
                  <Text style={styles.planSub}>$9.99/month, billed monthly</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Founder Lifetime */}
            <TouchableOpacity
              style={[
                styles.planCard,
                selectedTier === "FOUNDER_LIFETIME" && styles.planCardSelected,
              ]}
              onPress={() => setSelectedTier("FOUNDER_LIFETIME")}
              activeOpacity={0.85}
            >
              <View style={styles.planCardHeader}>
                <View style={styles.radioOuter}>
                  {selectedTier === "FOUNDER_LIFETIME" && <View style={styles.radioInner} />}
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.planTitleRow}>
                    <Text style={styles.planName}>Founder Lifetime</Text>
                    <View style={[styles.saveBadge, { backgroundColor: "#FEF3C7" }]}>
                      <Text style={[styles.saveBadgeText, { color: "#D97706" }]}>ONE-TIME</Text>
                    </View>
                  </View>
                  <Text style={styles.planSub}>$199.99 pay once, yours forever</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Features Comparison Checklist */}
          <View style={styles.featuresSection}>
            <Text style={styles.featuresHeader}>EVERYTHING INCLUDED IN PRO</Text>

            <View style={styles.featureItem}>
              <View style={styles.checkCircle}>
                <Check size={14} color="#059669" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>Unlimited AI Facial Scans</Text>
                <Text style={styles.featureDesc}>No monthly scan limits or queue throttling</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.checkCircle}>
                <Check size={14} color="#059669" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>Interactive 3D Face Map & Heatmaps</Text>
                <Text style={styles.featureDesc}>Sebum distribution, microvascular erythema & UV spot tracking</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.checkCircle}>
                <Check size={14} color="#059669" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>Clinical PDF & Dermatologist Sharing</Text>
                <Text style={styles.featureDesc}>One-click verifiable exports for clinical consultations</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.checkCircle}>
                <Check size={14} color="#059669" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>60-Second Audio Walkthrough</Text>
                <Text style={styles.featureDesc}>Synthesized speech summaries of localized findings and actives</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.checkCircle}>
                <Check size={14} color="#059669" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>Multi-Profile Family Access</Text>
                <Text style={styles.featureDesc}>Manage up to 5 profiles for partners and family members</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={styles.subscribeBtn}
            onPress={handleSubscribe}
            disabled={isUpgrading}
            activeOpacity={0.85}
          >
            {isUpgrading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.subscribeBtnText}>
                {selectedTier === "FOUNDER_LIFETIME"
                  ? "Get Lifetime Access • $199.99"
                  : "Start 7-Day Free Trial"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.restoreBtn} onPress={handleRestore}>
            <Text style={styles.restoreBtnText}>Restore Previous Purchases</Text>
          </TouchableOpacity>

          {/* Medical Disclaimer */}
          <Text style={styles.disclaimerText}>
            Medical Disclaimer: SkinSense is a wellness evaluation and cosmetic assessment tool, not a diagnostic medical device. Subscriptions renew automatically unless cancelled at least 24 hours before the end of the billing period.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerKicker: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 1.5,
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  heroBox: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F0F9FF",
    borderWidth: 1,
    borderColor: "#BAE6FD",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.4,
    marginBottom: 6,
    textAlign: "center",
  },
  heroSub: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  trialPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  trialPillText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#065F46",
    letterSpacing: 0.5,
  },
  plansContainer: {
    gap: 10,
    marginBottom: 24,
  },
  planCard: {
    backgroundColor: "#FAFAFA",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 16,
  },
  planCardSelected: {
    borderColor: "#0284C7",
    backgroundColor: "#F0F9FF",
  },
  planCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#0284C7",
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#0284C7",
  },
  planTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  planName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },
  planSub: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  saveBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  saveBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#15803D",
  },
  featuresSection: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
  },
  featuresHeader: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 1.2,
    marginBottom: 14,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 12,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  featureDesc: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1,
  },
  subscribeBtn: {
    backgroundColor: "#0F172A",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  subscribeBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  restoreBtn: {
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 16,
  },
  restoreBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  disclaimerText: {
    fontSize: 10,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 14,
  },
});
