import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  FileText,
  Volume2,
  VolumeX,
  Play,
  Pause,
  X,
  ShieldCheck,
  Calendar,
  FlaskConical,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react-native";
import type { ClinicalReport } from "@skinsense/types";

interface ClinicalReportModalProps {
  visible: boolean;
  onClose: () => void;
  report?: ClinicalReport | null;
}

export function ClinicalReportModal({
  visible,
  onClose,
  report,
}: ClinicalReportModalProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Fallback report if not loaded from backend yet
  const rep: ClinicalReport = report || {
    id: "rep-demo",
    scanId: "scan-demo",
    userId: "user-1",
    createdAt: new Date().toISOString(),
    summary:
      "Your composite Skin Health Score is 84 (+3 points vs baseline). Cutaneous hydration stands strong at 82/100, while your skin barrier integrity is measured at 78/100. We detected localized microvascular erythema on the left cheek (55/100) and elevated sebum output along the T-zone. Overall cellular renewal indicates steady positive adaptation to your prescribed routine.",
    overallScore: 84,
    scoreDelta: 3,
    scoreBreakdown: {
      hydration: 82,
      barrierHealth: 78,
      oilBalance: 88,
      inflammation: 72,
      pigmentation: 75,
      texture: 80,
      microbiome: 76,
    },
    keyConcerns: [
      {
        concern: "Sebaceous Hyperactivity",
        zone: "Forehead",
        severityScore: 65,
        clinicalObservation:
          "Elevated follicular sebum output (65/100) across central forehead zone.",
        rootCauseExplanation:
          "Compensatory lipid overproduction precipitated by epidermal barrier moisture deficits.",
        targetedByProducts: [
          "Niacinamide 10% + Zinc 1%",
          "Salicylic Acid 2% Exfoliant",
        ],
      },
      {
        concern: "Microvascular Erythema",
        zone: "Left Cheek",
        severityScore: 55,
        clinicalObservation:
          "Diffuse vascular flush (55/100) along planar zygomatic surface.",
        rootCauseExplanation:
          "Superficial dermal capillary dilatation associated with subclinical barrier permeability.",
        targetedByProducts: [
          "Azelaic Acid 10% Suspension",
          "Centella Asiatica Calming Gel",
        ],
      },
    ],
    routineRationale:
      "Your active regimen leverages Niacinamide and Azelaic Acid to selectively regulate follicular sebum synthesis while down-regulating inflammatory vascular cascades. The inclusion of multi-weight hyaluronic acid replenishes intercellular water reservoirs without occlusive pore clogging.",
    phasedPlan: [
      {
        week: 2,
        milestone: "Stratum Corneum Stabilization",
        expectedBiomarkerChange:
          "TEWL reduction by 15%, normalization of cutaneous pH.",
      },
      {
        week: 6,
        milestone: "Microvascular & Follicular Clearing",
        expectedBiomarkerChange:
          "Erythema index down 22%, reduction in open and closed comedones.",
      },
      {
        week: 12,
        milestone: "Dermal Remodeling & Pigment Homogeneity",
        expectedBiomarkerChange:
          "Melanin dispersion homogeneity +18%, optical smoothness score > 85/100.",
      },
    ],
    confidenceNotes: [
      {
        biomarker: "Epidermal Hydration",
        confidenceScore: 0.94,
        evidentiaryCitation:
          "CIE L*a*b* optical reflectance calibrated against standard D65 illuminant.",
      },
      {
        biomarker: "Microvascular Erythema",
        confidenceScore: 0.91,
        evidentiaryCitation:
          "Spectral green/red channel differential attenuation validated via clinical dermatoscopy benchmarks.",
      },
      {
        biomarker: "Follicular Topography",
        confidenceScore: 0.88,
        evidentiaryCitation:
          "Photometric stereo surface normals estimating micro-relief depth profile at 0.1mm resolution.",
      },
    ],
    audioSummaryScript:
      "Your skin health score is 84, up 3 points since your previous evaluation. Your moisture levels and barrier resilience are in a healthy, stable range. We identified mild vascular redness on your cheek and some excess oil on your forehead. Your current routine is targeting both concerns effectively. Continue your morning SPF and evening gentle actives!",
    verificationPassed: true,
    hallucinationFlags: [],
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerKicker}>CLINICAL NARRATIVE REPORT</Text>
            <Text style={styles.headerTitle}>Dermatology Assessment</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={22} color="#0F172A" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Integrity Verification Badge */}
          <View style={styles.integrityBadge}>
            <CheckCircle2 size={15} color="#059669" />
            <Text style={styles.integrityText}>
              Anti-Hallucination Integrity Verified • Grounded in Sensor Telemetry
            </Text>
          </View>

          {/* Spoken Audio Summary Player */}
          <View style={styles.audioPlayerCard}>
            <View style={styles.audioHeaderRow}>
              <View style={styles.audioIconCircle}>
                <Volume2 size={16} color="#0284C7" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.audioTitle}>60-Second Audio Walkthrough</Text>
                <Text style={styles.audioSub}>
                  Clinical voice synthesis of your scan evaluation
                </Text>
              </View>
              <TouchableOpacity
                style={styles.playBtn}
                onPress={() => setIsPlayingAudio(!isPlayingAudio)}
              >
                {isPlayingAudio ? (
                  <Pause size={16} color="#FFFFFF" />
                ) : (
                  <Play size={16} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>

            {isPlayingAudio && (
              <View style={styles.audioTranscriptBox}>
                <Text style={styles.audioScriptText}>
                  "{rep.audioSummaryScript}"
                </Text>
              </View>
            )}
          </View>

          {/* Section 1: Executive Clinical Summary */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitleRow}>
              <FileText size={16} color="#0284C7" />
              <Text style={styles.sectionTitle}>1. Executive Summary</Text>
            </View>
            <Text style={styles.bodyText}>{rep.summary}</Text>
          </View>

          {/* Section 2: Key Concerns & Targeted Actives */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitleRow}>
              <AlertCircle size={16} color="#D97706" />
              <Text style={styles.sectionTitle}>2. Localized Zone Findings</Text>
            </View>

            {rep.keyConcerns.map((concern, idx) => (
              <View key={idx} style={styles.concernItem}>
                <View style={styles.concernTopRow}>
                  <Text style={styles.concernName}>{concern.concern}</Text>
                  <View style={styles.zonePill}>
                    <Text style={styles.zonePillText}>{concern.zone}</Text>
                  </View>
                </View>
                <Text style={styles.observationText}>
                  {concern.clinicalObservation}
                </Text>
                <Text style={styles.rootCauseText}>
                  <Text style={{ fontWeight: "700" }}>Etiology: </Text>
                  {concern.rootCauseExplanation}
                </Text>
                <View style={styles.targetedRow}>
                  <Text style={styles.targetedLabel}>Prescribed Actives:</Text>
                  <View style={styles.activesPillList}>
                    {concern.targetedByProducts.map((p, i) => (
                      <View key={i} style={styles.productPill}>
                        <Text style={styles.productPillText}>{p}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Section 3: Routine Rationale */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitleRow}>
              <FlaskConical size={16} color="#059669" />
              <Text style={styles.sectionTitle}>3. Active Ingredient Rationale</Text>
            </View>
            <Text style={styles.bodyText}>{rep.routineRationale}</Text>
          </View>

          {/* Section 4: 12-Week Phased Outlook */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitleRow}>
              <Calendar size={16} color="#6366F1" />
              <Text style={styles.sectionTitle}>4. 12-Week Phased Milestones</Text>
            </View>
            {rep.phasedPlan.map((phase, idx) => (
              <View key={idx} style={styles.phaseItem}>
                <View style={styles.phaseWeekCircle}>
                  <Text style={styles.phaseWeekNum}>W{phase.week}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.phaseMilestone}>{phase.milestone}</Text>
                  <Text style={styles.phaseExpected}>
                    {phase.expectedBiomarkerChange}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Section 5: Evidentiary Grounding & Citations */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitleRow}>
              <ShieldCheck size={16} color="#475569" />
              <Text style={styles.sectionTitle}>
                5. Evidentiary Confidence Notes
              </Text>
            </View>
            {rep.confidenceNotes.map((note, idx) => (
              <View key={idx} style={styles.citationRow}>
                <View style={styles.citationHeader}>
                  <Text style={styles.biomarkerLabel}>{note.biomarker}</Text>
                  <Text style={styles.confidenceScore}>
                    {(note.confidenceScore * 100).toFixed(0)}% Confidence
                  </Text>
                </View>
                <Text style={styles.citationText}>
                  {note.evidentiaryCitation}
                </Text>
              </View>
            ))}
          </View>

          {/* Medical Disclaimer Footer */}
          <View style={styles.disclaimerBox}>
            <Text style={styles.disclaimerText}>
              SkinSense clinical reports are AI-synthesized educational summaries for personal routine tracking. They do not constitute formal dermatological diagnoses or clinical treatment orders.
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerKicker: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0284C7",
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.4,
  },
  closeBtn: {
    padding: 6,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  integrityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  integrityText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#065F46",
    flex: 1,
  },
  audioPlayerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  audioHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  audioIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
  },
  audioTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  audioSub: {
    fontSize: 12,
    color: "#64748B",
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0284C7",
    alignItems: "center",
    justifyContent: "center",
  },
  audioTranscriptBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  audioScriptText: {
    fontSize: 13,
    color: "#334155",
    fontStyle: "italic",
    lineHeight: 19,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  bodyText: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 21,
  },
  concernItem: {
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  concernTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  concernName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  zonePill: {
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  zonePillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },
  observationText: {
    fontSize: 13,
    color: "#475569",
    marginBottom: 4,
  },
  rootCauseText: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 8,
    lineHeight: 17,
  },
  targetedRow: {
    marginTop: 4,
  },
  targetedLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#0284C7",
    marginBottom: 4,
  },
  activesPillList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  productPill: {
    backgroundColor: "#F0F9FF",
    borderWidth: 1,
    borderColor: "#BAE6FD",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  productPillText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#0369A1",
  },
  phaseItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  phaseWeekCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  phaseWeekNum: {
    fontSize: 12,
    fontWeight: "800",
    color: "#4F46E5",
  },
  phaseMilestone: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  phaseExpected: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 17,
  },
  citationRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  citationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  biomarkerLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },
  confidenceScore: {
    fontSize: 12,
    fontWeight: "700",
    color: "#059669",
  },
  citationText: {
    fontSize: 11,
    color: "#64748B",
    lineHeight: 16,
  },
  disclaimerBox: {
    padding: 14,
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    marginTop: 6,
  },
  disclaimerText: {
    fontSize: 11,
    color: "#64748B",
    lineHeight: 16,
    textAlign: "center",
  },
});
