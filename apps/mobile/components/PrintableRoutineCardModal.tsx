import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import {
  Printer,
  X,
  Sun,
  Moon,
  Clock,
  Download,
  QrCode,
} from "lucide-react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import type { PrintableRoutineCardData, RoutineCardStep } from "@skinsense/types";

interface PrintableRoutineCardModalProps {
  visible: boolean;
  onClose: () => void;
  cardData?: PrintableRoutineCardData;
}

const DEFAULT_CARD_DATA: PrintableRoutineCardData = {
  userName: "Alex Rivera",
  generatedDate: "Oct 01, 2026",
  amSteps: [
    {
      step: 1,
      name: "Gentle Foaming Cleanser",
      category: "Cleanser",
      amount: "Dime-sized with lukewarm water",
      waitTimeMinutes: 0,
    },
    {
      step: 2,
      name: "Hyaluronic Acid 2% + B5",
      category: "Hydration",
      amount: "3-4 drops on damp skin",
      waitTimeMinutes: 1,
    },
    {
      step: 3,
      name: "Niacinamide 10% + Zinc 1%",
      category: "Sebum Regulation",
      amount: "2-3 drops patted evenly",
      waitTimeMinutes: 2,
    },
    {
      step: 4,
      name: "Natural Moisturizing Factors + Phytoceramides",
      category: "Barrier Cream",
      amount: "Pea-sized amount",
      waitTimeMinutes: 3,
    },
    {
      step: 5,
      name: "Mineral UV Filters SPF 50 with Antioxidants",
      category: "Photoprotection",
      amount: "Two finger lengths",
      waitTimeMinutes: 0,
    },
  ],
  pmSteps: [
    {
      step: 1,
      name: "Squalane Cleanser (First Cleanse)",
      category: "Oil Phase",
      amount: "Nickel-sized rubbed in dry palms",
      waitTimeMinutes: 0,
    },
    {
      step: 2,
      name: "Gentle Foaming Cleanser (Second Cleanse)",
      category: "Water Phase",
      amount: "Dime-sized, rinse thoroughly",
      waitTimeMinutes: 0,
    },
    {
      step: 3,
      name: "Azelaic Acid 10% Suspension",
      category: "Active Treatment",
      amount: "Pea-sized on dry skin",
      waitTimeMinutes: 5,
    },
    {
      step: 4,
      name: "Barrier Support Ceramide Cream",
      category: "Night Seal",
      amount: "Generous pea-sized layer",
      waitTimeMinutes: 0,
    },
  ],
  weeklyChecklistDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  verificationQrPayload: "skinsense://routine/card-verify?v=1",
};

function buildStepHtml(step: RoutineCardStep, color: string, bgColor: string): string {
  const waitBadge =
    step.waitTimeMinutes > 0
      ? `<span class="wait-pill" style="background:${bgColor};color:${color};">&#9202; ${step.waitTimeMinutes} min</span>`
      : "";
  return `
    <div class="step-row">
      <div class="step-num" style="background:${bgColor};color:${color};">${step.step}</div>
      <div class="step-body">
        <div class="step-name">${step.name}</div>
        <div class="step-meta">${step.category} &bull; <span style="color:${color};font-weight:600;">${step.amount}</span></div>
      </div>
      ${waitBadge}
    </div>`;
}

function buildPdfHtml(data: PrintableRoutineCardData): string {
  const amStepsHtml = data.amSteps
    .map((s) => buildStepHtml(s, "#0284c7", "#e0f2fe"))
    .join("");
  const pmStepsHtml = data.pmSteps
    .map((s) => buildStepHtml(s, "#4f46e5", "#eef2ff"))
    .join("");

  const checkDayHeaders = data.weeklyChecklistDays
    .map((d) => `<th class="chk-day">${d}</th>`)
    .join("");
  const checkboxCells = data.weeklyChecklistDays
    .map(() => `<td><div class="checkbox"></div></td>`)
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>SkinSense Routine Card</title>
  <style>
    @page {
      size: A4;
      margin: 14mm 16mm;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .card {
      border: 2px solid #0f172a;
      border-radius: 16px;
      padding: 24px 28px;
      max-width: 680px;
      margin: 0 auto;
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 3px solid #0f172a;
      padding-bottom: 14px;
      margin-bottom: 20px;
    }
    .brand {
      font-size: 22px;
      font-weight: 900;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }
    .brand-sub {
      font-size: 11px;
      color: #64748b;
      font-weight: 500;
      margin-top: 2px;
      letter-spacing: 0.3px;
    }
    .patient-info {
      font-size: 13px;
      color: #334155;
      font-weight: 600;
      margin-top: 6px;
    }
    .badge-verified {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #15803d;
      font-size: 10px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      letter-spacing: 0.5px;
    }
    .header-right {
      text-align: right;
    }
    .mirror-tag {
      font-size: 10px;
      color: #94a3b8;
      font-weight: 600;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      margin-bottom: 6px;
    }

    /* Two-column layout */
    .columns {
      display: flex;
      gap: 18px;
      margin-bottom: 20px;
    }
    .col {
      flex: 1;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px;
      background: #fafbfc;
    }
    .col-title {
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .col-title .icon {
      font-size: 16px;
    }

    /* Steps */
    .step-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 7px 0;
      border-bottom: 1px solid #f1f5f9;
    }
    .step-row:last-child { border-bottom: none; }
    .step-num {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 800;
      flex-shrink: 0;
    }
    .step-body { flex: 1; }
    .step-name {
      font-size: 12.5px;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.3;
    }
    .step-meta {
      font-size: 10.5px;
      color: #64748b;
      margin-top: 1px;
    }
    .wait-pill {
      font-size: 9px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 4px;
      white-space: nowrap;
      flex-shrink: 0;
    }

    /* Weekly tracker */
    .tracker {
      border-top: 2px solid #e2e8f0;
      padding-top: 14px;
      margin-bottom: 16px;
    }
    .tracker-title {
      font-size: 12px;
      font-weight: 800;
      color: #334155;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 10px;
    }
    .tracker-table {
      width: 100%;
      border-collapse: collapse;
    }
    .tracker-table th,
    .tracker-table td {
      border: 1.5px solid #cbd5e1;
      padding: 6px 4px;
      text-align: center;
      font-size: 11px;
    }
    .tracker-table th {
      background: #f8fafc;
      font-weight: 700;
      color: #64748b;
    }
    .tracker-table td:first-child,
    .tracker-table th:first-child {
      text-align: left;
      font-weight: 700;
      color: #0f172a;
      width: 90px;
      padding-left: 8px;
    }
    .checkbox {
      width: 18px;
      height: 18px;
      border: 2px solid #94a3b8;
      border-radius: 4px;
      margin: 0 auto;
    }

    /* Footer */
    .footer {
      text-align: center;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
    }
    .footer-instruction {
      font-size: 12px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 4px;
    }
    .footer-cut {
      font-size: 9px;
      color: #94a3b8;
      letter-spacing: 2px;
    }
    .footer-disclaimer {
      font-size: 8.5px;
      color: #94a3b8;
      margin-top: 8px;
      line-height: 1.4;
    }

    /* Cut line (dashed border around card for easy cutting) */
    .cut-guide {
      border: 2px dashed #cbd5e1;
      border-radius: 20px;
      padding: 8px;
    }
  </style>
</head>
<body>
  <div class="cut-guide">
    <div class="card">
      <div class="header">
        <div>
          <div class="brand">SkinSense</div>
          <div class="brand-sub">Personalized Clinical Skincare Protocol</div>
          <div class="patient-info">${data.userName} &bull; ${data.generatedDate}</div>
        </div>
        <div class="header-right">
          <div class="mirror-tag">Bathroom Mirror Card</div>
          <div class="badge-verified">&#10003; Verified Protocol</div>
        </div>
      </div>

      <div class="columns">
        <div class="col">
          <div class="col-title" style="color:#0284c7;">
            <span class="icon">&#9728;&#65039;</span> Morning (AM) &mdash; ${data.amSteps.length} Steps
          </div>
          ${amStepsHtml}
        </div>
        <div class="col">
          <div class="col-title" style="color:#4f46e5;">
            <span class="icon">&#127769;</span> Evening (PM) &mdash; ${data.pmSteps.length} Steps
          </div>
          ${pmStepsHtml}
        </div>
      </div>

      <div class="tracker">
        <div class="tracker-title">Weekly Adherence Tracker</div>
        <table class="tracker-table">
          <thead>
            <tr>
              <th>Routine</th>
              ${checkDayHeaders}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>AM &#9728;&#65039;</td>
              ${checkboxCells}
            </tr>
            <tr>
              <td>PM &#127769;</td>
              ${checkboxCells}
            </tr>
          </tbody>
        </table>
      </div>

      <div class="footer">
        <div class="footer-instruction">&#9986; Cut along dashed line &bull; Tape at eye-level on your bathroom mirror</div>
        <div class="footer-cut">- - - - - - - - - - - - - - - - - - - - - - - - - - - -</div>
        <div class="footer-disclaimer">
          SkinSense recommendations are AI-generated and do not constitute medical advice.
          Always verify active ingredients with a board-certified dermatologist.
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export function PrintableRoutineCardModal({
  visible,
  onClose,
  cardData = DEFAULT_CARD_DATA,
}: PrintableRoutineCardModalProps) {
  const [generating, setGenerating] = useState(false);

  const handlePrint = async () => {
    const html = buildPdfHtml(cardData);
    await Print.printAsync({ html });
  };

  const handleSharePdf = async () => {
    setGenerating(true);
    try {
      const html = buildPdfHtml(cardData);
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Share Routine Card PDF",
        UTI: "com.adobe.pdf",
      });
    } catch {
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerKicker}>BATHROOM MIRROR GUIDE</Text>
            <Text style={styles.headerTitle}>Printable Routine Card</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={22} color="#0F172A" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.printBtn}
              onPress={handleSharePdf}
              disabled={generating}
            >
              {generating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Download size={16} color="#FFFFFF" />
              )}
              <Text style={styles.printBtnText}>
                {generating ? "Generating PDF..." : "Save & Share PDF"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.directPrintBtn} onPress={handlePrint}>
              <Printer size={16} color="#0F172A" />
              <Text style={styles.directPrintBtnText}>Print Directly</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.paperCard}>
            <View style={styles.paperHeader}>
              <View>
                <Text style={styles.paperBrand}>SKINSENSE PROTOCOL</Text>
                <Text style={styles.paperPatient}>
                  Patient: {cardData.userName} &bull; Date: {cardData.generatedDate}
                </Text>
              </View>
              <View style={styles.qrMock}>
                <QrCode size={28} color="#0F172A" />
                <Text style={styles.qrText}>Verified</Text>
              </View>
            </View>

            <View style={styles.protocolSection}>
              <View style={styles.protocolTitleRow}>
                <Sun size={16} color="#0284C7" />
                <Text style={[styles.protocolTitle, { color: "#0284C7" }]}>
                  Morning Protocol (AM)
                </Text>
              </View>

              {cardData.amSteps.map((step) => (
                <View key={step.step} style={styles.stepRow}>
                  <View style={styles.stepNumBadge}>
                    <Text style={styles.stepNumText}>{step.step}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.stepName}>{step.name}</Text>
                    <Text style={styles.stepMeta}>
                      {step.category} &bull;{" "}
                      <Text style={{ color: "#0284C7" }}>{step.amount}</Text>
                    </Text>
                  </View>
                  {step.waitTimeMinutes > 0 && (
                    <View style={styles.waitBadge}>
                      <Clock size={10} color="#0369A1" />
                      <Text style={styles.waitText}>{step.waitTimeMinutes}m</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>

            <View style={[styles.protocolSection, { marginTop: 14 }]}>
              <View style={styles.protocolTitleRow}>
                <Moon size={16} color="#4F46E5" />
                <Text style={[styles.protocolTitle, { color: "#4F46E5" }]}>
                  Evening Protocol (PM)
                </Text>
              </View>

              {cardData.pmSteps.map((step) => (
                <View key={step.step} style={styles.stepRow}>
                  <View style={[styles.stepNumBadge, { backgroundColor: "#EEF2FF" }]}>
                    <Text style={[styles.stepNumText, { color: "#4F46E5" }]}>
                      {step.step}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.stepName}>{step.name}</Text>
                    <Text style={styles.stepMeta}>
                      {step.category} &bull;{" "}
                      <Text style={{ color: "#4F46E5" }}>{step.amount}</Text>
                    </Text>
                  </View>
                  {step.waitTimeMinutes > 0 && (
                    <View style={[styles.waitBadge, { backgroundColor: "#EEF2FF" }]}>
                      <Clock size={10} color="#4F46E5" />
                      <Text style={[styles.waitText, { color: "#4F46E5" }]}>
                        {step.waitTimeMinutes}m
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>

            <View style={styles.trackingGridWrap}>
              <Text style={styles.trackingGridTitle}>Weekly Adherence Log</Text>
              <View style={styles.gridHeaderRow}>
                <Text style={styles.gridHeaderLead}>Protocol</Text>
                {cardData.weeklyChecklistDays.map((day) => (
                  <Text key={day} style={styles.gridHeaderDay}>
                    {day}
                  </Text>
                ))}
              </View>
              <View style={styles.gridRow}>
                <Text style={styles.gridLeadText}>AM</Text>
                {cardData.weeklyChecklistDays.map((day) => (
                  <View key={day} style={styles.checkboxMock} />
                ))}
              </View>
              <View style={styles.gridRow}>
                <Text style={styles.gridLeadText}>PM</Text>
                {cardData.weeklyChecklistDays.map((day) => (
                  <View key={day} style={styles.checkboxMock} />
                ))}
              </View>
            </View>

            <View style={styles.paperFooter}>
              <Text style={styles.paperFooterText}>
                Cut along the dashed line on the PDF. Tape at eye-level on your bathroom
                mirror.
              </Text>
            </View>
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
  actionRow: {
    gap: 10,
    marginBottom: 4,
  },
  printBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0F172A",
    borderRadius: 12,
    paddingVertical: 14,
  },
  printBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  directPrintBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  directPrintBtnText: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "700",
  },
  paperCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  paperHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#0F172A",
    paddingBottom: 12,
    marginBottom: 14,
  },
  paperBrand: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: 0.5,
  },
  paperPatient: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
    marginTop: 2,
  },
  qrMock: {
    alignItems: "center",
  },
  qrText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#64748B",
  },
  protocolSection: {
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  protocolTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  protocolTitle: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  stepNumBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0284C7",
  },
  stepName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  stepMeta: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1,
  },
  waitBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  waitText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#0369A1",
  },
  trackingGridWrap: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  trackingGridTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 8,
  },
  gridHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  gridHeaderLead: {
    width: 40,
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
  },
  gridHeaderDay: {
    flex: 1,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
  },
  gridRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  gridLeadText: {
    width: 40,
    fontSize: 11,
    fontWeight: "700",
    color: "#0F172A",
  },
  checkboxMock: {
    flex: 1,
    height: 20,
    marginHorizontal: 3,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
  },
  paperFooter: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  paperFooterText: {
    fontSize: 11,
    color: "#94A3B8",
    textAlign: "center",
    fontStyle: "italic",
  },
});
