import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Share,
} from "react-native";
import {
  Share2,
  X,
  Copy,
  Check,
  Shield,
  Clock,
  Trash2,
  ExternalLink,
} from "lucide-react-native";

interface DermatologistShareModalProps {
  visible: boolean;
  onClose: () => void;
}

export function DermatologistShareModal({
  visible,
  onClose,
}: DermatologistShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeLink, setActiveLink] = useState<string | null>(
    "https://skinsense.health/portal/patient/portal_9f82a17b4c9e",
  );

  const handleCopy = async () => {
    if (!activeLink) return;
    try {
      await Share.share({
        title: "SkinSense Dermatologist Access Link",
        message: `SkinSense Dermatologist Access Portal: ${activeLink}`,
      });
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateNewLink = () => {
    setLoading(true);
    setTimeout(() => {
      const newTok = Math.random().toString(36).substring(2, 12);
      setActiveLink(`https://skinsense.health/portal/patient/portal_${newTok}`);
      setLoading(false);
      Alert.alert("New Link Generated", "Valid for 90 days with secure read-only access.");
    }, 600);
  };

  const handleRevoke = () => {
    Alert.alert(
      "Revoke Access?",
      "Your dermatologist will no longer be able to view your scan history or leave notes.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Revoke",
          style: "destructive",
          onPress: () => {
            setActiveLink(null);
            Alert.alert("Access Revoked", "Dermatologist access has been terminated.");
          },
        },
      ],
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Share2 size={20} color="#0284C7" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Share with Dermatologist</Text>
                <Text style={styles.headerSub}>Secure, Expiring Clinician Link</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
              <X size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Privacy Shield Banner */}
            <View style={styles.privacyBanner}>
              <Shield size={18} color="#10B981" />
              <View style={styles.privacyContent}>
                <Text style={styles.privacyTitle}>Zero-Friction Doctor Access</Text>
                <Text style={styles.privacySub}>
                  No login required for your doctor. Provides read-only access to your scan timeline, routine, and findings.
                </Text>
              </View>
            </View>

            {/* Active Link Box */}
            {activeLink ? (
              <View style={styles.linkCard}>
                <View style={styles.linkHeader}>
                  <View style={styles.activePill}>
                    <View style={styles.activeDot} />
                    <Text style={styles.activeText}>ACTIVE LINK (89 DAYS LEFT)</Text>
                  </View>
                  <TouchableOpacity onPress={handleRevoke}>
                    <Text style={styles.revokeText}>Revoke Access</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.linkInputRow}>
                  <TextInput
                    style={styles.linkInput}
                    value={activeLink}
                    editable={false}
                    selectTextOnFocus
                  />
                  <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
                    {copied ? (
                      <Check size={18} color="#10B981" />
                    ) : (
                      <Copy size={18} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                </View>

                <Text style={styles.linkHint}>
                  Copy and text or email this link to your doctor or dermatology clinic intake coordinator.
                </Text>
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <Clock size={32} color="#64748B" />
                <Text style={styles.emptyTitle}>No Active Invite Link</Text>
                <Text style={styles.emptySub}>
                  Generate a temporary link whenever you have an upcoming consultation.
                </Text>
                <TouchableOpacity
                  style={styles.generateBtn}
                  onPress={handleGenerateNewLink}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.generateBtnText}>Generate 90-Day Link</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* What your doctor sees */}
            <View style={styles.permissionsCard}>
              <Text style={styles.permissionsTitle}>WHAT YOUR DOCTOR WILL SEE</Text>
              <View style={styles.permRow}>
                <Text style={styles.permBullet}>•</Text>
                <Text style={styles.permText}>Longitudinal skin score trend and barrier history</Text>
              </View>
              <View style={styles.permRow}>
                <Text style={styles.permBullet}>•</Text>
                <Text style={styles.permText}>Face zone map with pinned ICD-10 findings</Text>
              </View>
              <View style={styles.permRow}>
                <Text style={styles.permBullet}>•</Text>
                <Text style={styles.permText}>Active AM/PM routine and INCI ingredient list</Text>
              </View>
              <View style={styles.permRow}>
                <Text style={styles.permBullet}>•</Text>
                <Text style={styles.permText}>Ability to leave doctor notes directly in your app</Text>
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#0F172A",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    paddingTop: 20,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0284C720",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#F8FAFC",
  },
  headerSub: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#1E293B",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  privacyBanner: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#10B98115",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#10B98130",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  privacyContent: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#34D399",
  },
  privacySub: {
    fontSize: 11,
    color: "#A7F3D0",
    marginTop: 3,
    lineHeight: 16,
  },
  linkCard: {
    backgroundColor: "#1E293B",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 16,
  },
  linkHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  activePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
  },
  activeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#10B981",
  },
  revokeText: {
    fontSize: 12,
    color: "#EF4444",
    fontWeight: "600",
  },
  linkInputRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  linkInput: {
    flex: 1,
    backgroundColor: "#0F172A",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#94A3B8",
    fontSize: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },
  copyBtn: {
    backgroundColor: "#0284C7",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  linkHint: {
    fontSize: 11,
    color: "#64748B",
    lineHeight: 16,
  },
  emptyCard: {
    backgroundColor: "#1E293B",
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#F8FAFC",
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 16,
  },
  generateBtn: {
    backgroundColor: "#0284C7",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  generateBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  permissionsCard: {
    backgroundColor: "#1E293B",
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#334155",
  },
  permissionsTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  permRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  permBullet: {
    color: "#38BDF8",
    fontWeight: "700",
  },
  permText: {
    flex: 1,
    color: "#E2E8F0",
    fontSize: 12,
    lineHeight: 17,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#1E293B",
    backgroundColor: "#0F172A",
  },
  doneBtn: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  doneBtnText: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "600",
  },
});
