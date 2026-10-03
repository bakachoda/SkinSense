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
                <Share2 size={16} color="#111827" />
              </View>
              <View>
                <Text style={styles.headerTitle}>CLINICIAN SECURE PORTAL</Text>
                <Text style={styles.headerSub}>Expiring 90-Day Read-Only Link</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
              <X size={18} color="#111827" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Privacy Shield Banner */}
            <View style={styles.privacyBanner}>
              <Shield size={16} color="#111827" />
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
                      <Check size={16} color="#FFFFFF" />
                    ) : (
                      <Copy size={16} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                </View>

                <Text style={styles.linkHint}>
                  Copy and text or email this link to your doctor or dermatology clinic intake coordinator.
                </Text>
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <Clock size={28} color="#6B7280" />
                <Text style={styles.emptyTitle}>NO ACTIVE INVITE LINK</Text>
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
                    <Text style={styles.generateBtnText}>GENERATE 90-DAY LINK</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* What your doctor sees */}
            <View style={styles.permissionsCard}>
              <Text style={styles.permissionsTitle}>CLINICIAN VIEW PRIVILEGES</Text>
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
              <Text style={styles.doneBtnText}>CLOSE</Text>
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
    backgroundColor: "rgba(17, 24, 39, 0.4)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "85%",
    paddingTop: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 6,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  headerSub: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 2,
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: "#F3F4F6",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  privacyBanner: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  privacyContent: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#111827",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  privacySub: {
    fontSize: 11,
    color: "#4B5563",
    marginTop: 2,
    lineHeight: 16,
  },
  linkCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 14,
  },
  linkHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  activePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#111827",
  },
  activeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  revokeText: {
    fontSize: 11,
    color: "#DC2626",
    fontWeight: "700",
  },
  linkInputRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  linkInput: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: "#111827",
    fontSize: 11,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  copyBtn: {
    backgroundColor: "#111827",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  linkHint: {
    fontSize: 10,
    color: "#6B7280",
    lineHeight: 15,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  emptyTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: 8,
  },
  emptySub: {
    fontSize: 11,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 14,
  },
  generateBtn: {
    backgroundColor: "#111827",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  generateBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  permissionsCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  permissionsTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  permRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 6,
  },
  permBullet: {
    color: "#111827",
    fontWeight: "700",
  },
  permText: {
    flex: 1,
    color: "#4B5563",
    fontSize: 11,
    lineHeight: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  doneBtn: {
    backgroundColor: "#111827",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  doneBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
});
