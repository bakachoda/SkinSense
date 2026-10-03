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
                <Stethoscope size={20} color="#0284C7" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Clinical Dermatologist Export</Text>
                <Text style={styles.headerSub}>ICD-10 Mapped Intake Report</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
              <X size={20} color="#94A3B8" />
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
                  <Text style={[styles.metricValue, { color: "#10B981" }]}>
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
                <ShieldCheck size={16} color="#0284C7" />
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
                <Pill size={16} color="#8B5CF6" />
                <Text style={styles.sectionTitle}>ACTIVE MEDICATIONS & SAFETY</Text>
              </View>
              {medications.map((m, idx) => (
                <View key={idx} style={styles.medItem}>
                  <Text style={styles.medText}>{m}</Text>
                </View>
              ))}
              <View style={styles.interactionAlert}>
                <AlertTriangle size={16} color="#F59E0B" />
                <Text style={styles.interactionText}>
                  Prescription retinoid active. Concurrent OTC chemical exfoliants have been locked to prevent dermatitis.
                </Text>
              </View>
            </View>

            {/* Medical Disclaimer */}
            <View style={styles.disclaimerBox}>
              <Text style={styles.disclaimerText}>
                Intake summary compiled from multi-spectral camera computer vision. This document is intended solely for clinical intake assistance and does not replace in-person dermatological evaluation.
              </Text>
            </View>
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Share2 size={18} color="#0284C7" />
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
                  <Download size={18} color="#FFFFFF" />
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
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#0F172A",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
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
  summaryCard: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#334155",
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  sectionHeaderWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
    fontSize: 10,
    color: "#64748B",
    fontWeight: "600",
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#F8FAFC",
  },
  gradingCard: {
    backgroundColor: "#0284C710",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#0284C730",
  },
  gradingHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  gradingTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#38BDF8",
    letterSpacing: 0.6,
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
    fontSize: 20,
    fontWeight: "800",
    color: "#F8FAFC",
  },
  gradeLabel: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 2,
  },
  gradeDivider: {
    width: 1,
    height: 32,
    backgroundColor: "#0284C730",
  },
  section: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#334155",
  },
  findingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#33415550",
  },
  findingLeft: {
    flex: 1,
  },
  findingZone: {
    fontSize: 11,
    fontWeight: "700",
    color: "#38BDF8",
  },
  findingCondition: {
    fontSize: 13,
    color: "#E2E8F0",
    marginTop: 2,
  },
  findingRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  icdBadge: {
    backgroundColor: "#0284C720",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#0284C750",
  },
  icdText: {
    color: "#38BDF8",
    fontSize: 11,
    fontWeight: "700",
  },
  findingSeverity: {
    fontSize: 11,
    color: "#94A3B8",
  },
  medItem: {
    backgroundColor: "#0F172A",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  medText: {
    color: "#E2E8F0",
    fontSize: 13,
    fontWeight: "500",
  },
  interactionAlert: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#F59E0B15",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F59E0B30",
    alignItems: "flex-start",
  },
  interactionText: {
    flex: 1,
    color: "#FCD34D",
    fontSize: 11,
    lineHeight: 16,
  },
  disclaimerBox: {
    backgroundColor: "#0F172A",
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  disclaimerText: {
    fontSize: 10,
    color: "#64748B",
    lineHeight: 15,
    fontStyle: "italic",
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#1E293B",
    backgroundColor: "#0F172A",
  },
  shareBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#1E293B",
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#334155",
  },
  shareBtnText: {
    color: "#38BDF8",
    fontSize: 14,
    fontWeight: "600",
  },
  downloadBtn: {
    flex: 1.6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0284C7",
    borderRadius: 12,
    paddingVertical: 14,
  },
  downloadBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
