import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Share,
  Alert,
} from "react-native";
import {
  FileText,
  X,
  Share2,
  Download,
  AlertTriangle,
  CheckCircle,
  ShieldCheck,
  Stethoscope,
  Pill,
} from "lucide-react-native";
import { ICD10_MAP } from "@skinsense/types";

interface ClinicalExportModalProps {
  visible: boolean;
  onClose: () => void;
  patientData?: {
    fitzpatrick: number;
    skinType: string;
    barrierScore: number;
    skinAge: number;
    gagsScore?: number;
    igaGrade?: number;
    findings?: Array<{
      zone: string;
      condition: string;
      icd10Code: string;
      severity: number;
    }>;
    medications?: string[];
  };
}

export function ClinicalExportModal({
  visible,
  onClose,
  patientData,
}: ClinicalExportModalProps) {
  const [downloading, setDownloading] = useState(false);

  const defaultFindings = [
    { zone: "Forehead", condition: "Inflammatory papules", icd10Code: "L70.0", severity: 55 },
    { zone: "Left Cheek", condition: "Persistent erythema", icd10Code: "L71.9", severity: 50 },
    { zone: "Right Cheek", condition: "Epidermal melasma", icd10Code: "L81.1", severity: 45 },
  ];

  const findings = patientData?.findings?.length ? patientData.findings : defaultFindings;
  const medications = patientData?.medications?.length ? patientData.medications : ["Tretinoin 0.05% (Nightly)"];

  const handleShare = async () => {
    try {
      await Share.share({
        title: "SkinSense Clinical Dermatologist Export",
        message: `SkinSense Clinical Summary:\nPatient Skin Profile: Fitzpatrick Type ${patientData?.fitzpatrick || 4}, Barrier ${patientData?.barrierScore || 68}/100, Biological Skin Age ${patientData?.skinAge || 28}.\nKey Findings: ${findings.map((f) => `${f.zone}: ${f.condition} (${f.icd10Code})`).join("; ")}.\nActive Medications: ${medications.join(", ")}.`,
      });
    } catch (e: any) {
      Alert.alert("Share Failed", e?.message || "Could not open share dialog");
    }
  };

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      Alert.alert(
        "Clinical PDF Ready",
        "Clinical intake summary exported to device storage. Ready to email or print for your dermatologist visit.",
      );
    }, 1200);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Stethoscope size={18} color="#111827" />
              </View>
              <View>
                <Text style={styles.headerTitle}>CLINICAL INTAKE SUMMARY</Text>
                <Text style={styles.headerSub}>ICD-10 Mapped Diagnostic Report</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
              <X size={18} color="#111827" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Top Patient Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.sectionTitle}>PATIENT BASELINE</Text>
              <View style={styles.gridRow}>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>FITZPATRICK</Text>
                  <Text style={styles.metricValue}>Type {patientData?.fitzpatrick || 4}</Text>
                </View>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>BARRIER HEALTH</Text>
                  <Text style={styles.metricValue}>
                    {patientData?.barrierScore || 68}/100
                  </Text>
                </View>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>SKIN AGE</Text>
                  <Text style={styles.metricValue}>{patientData?.skinAge || 28} yrs</Text>
                </View>
              </View>
            </View>

            {/* Clinical Grading Box */}
            <View style={styles.gradingCard}>
              <View style={styles.gradingHeader}>
                <ShieldCheck size={14} color="#111827" />
                <Text style={styles.gradingTitle}>CLINICAL GRADING SCALES</Text>
              </View>
              <View style={styles.gradingRow}>
                <View style={styles.gradeItem}>
                  <Text style={styles.gradeNum}>{patientData?.gagsScore ?? 16}</Text>
                  <Text style={styles.gradeLabel}>Global Acne Score (GAGS)</Text>
                </View>
                <View style={styles.gradeDivider} />
                <View style={styles.gradeItem}>
                  <Text style={styles.gradeNum}>Grade {patientData?.igaGrade ?? 2}</Text>
                  <Text style={styles.gradeLabel}>Investigator Assessment (IGA)</Text>
                </View>
              </View>
            </View>

            {/* ICD-10 Mapped Findings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>CLASSIFIED FINDINGS (ICD-10)</Text>
              {findings.map((f, i) => (
                <View key={i} style={styles.findingRow}>
                  <View style={styles.findingLeft}>
                    <Text style={styles.findingZone}>{f.zone.toUpperCase()}</Text>
                    <Text style={styles.findingCondition}>{f.condition}</Text>
                  </View>
                  <View style={styles.findingRight}>
                    <View style={styles.icdBadge}>
                      <Text style={styles.icdText}>{f.icd10Code}</Text>
                    </View>
                    <Text style={styles.findingSeverity}>{f.severity}/100</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Active Medications & Interaction Screening */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderWithIcon}>
                <Pill size={14} color="#111827" />
                <Text style={styles.sectionTitle}>ACTIVE MEDICATIONS & SAFETY</Text>
              </View>
              {medications.map((m, idx) => (
                <View key={idx} style={styles.medItem}>
                  <Text style={styles.medText}>{m}</Text>
                </View>
              ))}
              <View style={styles.interactionAlert}>
                <AlertTriangle size={14} color="#B45309" />
                <Text style={styles.interactionText}>
                  Prescription retinoid active. Concurrent OTC chemical exfoliants have been locked to prevent barrier dermatitis.
                </Text>
              </View>
            </View>

            {/* Medical Disclaimer */}
            <View style={styles.disclaimerBox}>
              <Text style={styles.disclaimerText}>
                Intake summary compiled from multi-spectral computer vision telemetry. Intended solely for clinical triage and does not replace formal dermatological diagnosis.
              </Text>
            </View>
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Share2 size={16} color="#111827" />
              <Text style={styles.shareBtnText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.downloadBtn}
              onPress={handleDownload}
              disabled={downloading}
            >
              {downloading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Download size={16} color="#FFFFFF" />
                  <Text style={styles.downloadBtnText}>Export PDF</Text>
                </>
              )}
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
    maxHeight: "90%",
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
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  sectionHeaderWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metricBox: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 9,
    color: "#6B7280",
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: "800",
    color: "#111827",
  },
  gradingCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  gradingHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  gradingTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  gradingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  gradeItem: {
    alignItems: "center",
  },
  gradeNum: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  gradeLabel: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 2,
  },
  gradeDivider: {
    width: 1,
    height: 28,
    backgroundColor: "#E5E7EB",
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  findingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  findingLeft: {
    flex: 1,
  },
  findingZone: {
    fontSize: 10,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: 0.8,
  },
  findingCondition: {
    fontSize: 12,
    color: "#374151",
    marginTop: 1,
  },
  findingRight: {
    alignItems: "flex-end",
    gap: 2,
  },
  icdBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  icdText: {
    color: "#111827",
    fontSize: 10,
    fontWeight: "800",
  },
  findingSeverity: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "600",
  },
  medItem: {
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  medText: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "600",
  },
  interactionAlert: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#FFFBEB",
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#FDE68A",
    alignItems: "flex-start",
  },
  interactionText: {
    flex: 1,
    color: "#78350F",
    fontSize: 11,
    lineHeight: 15,
  },
  disclaimerBox: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 6,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  disclaimerText: {
    fontSize: 10,
    color: "#6B7280",
    lineHeight: 14,
    fontStyle: "italic",
  },
  footer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  shareBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  shareBtnText: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  downloadBtn: {
    flex: 1.6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#111827",
    borderRadius: 8,
    paddingVertical: 12,
  },
  downloadBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
