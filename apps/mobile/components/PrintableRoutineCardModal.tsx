import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Share,
} from "react-native";
import {
  Printer,
  Share2,
  X,
  Sun,
  Moon,
  Clock,
  CheckSquare,
  QrCode,
  ShieldAlert,
} from "lucide-react-native";
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

export function PrintableRoutineCardModal({
  visible,
  onClose,
  cardData = DEFAULT_CARD_DATA,
}: PrintableRoutineCardModalProps) {
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const handleShare = async () => {
    try {
      await Share.share({
        title: "SkinSense Printable Routine Card",
        message: `SkinSense Clinical Skincare Protocol for ${cardData.userName}:\n\n☀️ AM Protocol (5 Steps):\n${cardData.amSteps.map((s) => `${s.step}. ${s.name} (${s.amount})`).join("\n")}\n\n🌙 PM Protocol (4 Steps):\n${cardData.pmSteps.map((s) => `${s.step}. ${s.name} (${s.amount})`).join("\n")}\n\nGenerated: ${cardData.generatedDate}`,
      });
    } catch {}
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
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
          {/* Action Row */}
          <View style={styles.topActionRow}>
            <TouchableOpacity style={styles.printBtn} onPress={handleShare}>
              <Share2 size={16} color="#FFFFFF" />
              <Text style={styles.printBtnText}>Share & Print PDF Card</Text>
            </TouchableOpacity>
          </View>

          {/* Printable Card Container (styled like high-end clinical paper) */}
          <View style={styles.paperCard}>
            {/* Paper Header */}
            <View style={styles.paperHeader}>
              <View>
                <Text style={styles.paperBrand}>SKINSENSE PROTOCOL</Text>
                <Text style={styles.paperPatient}>
                  Patient: {cardData.userName} • Date: {cardData.generatedDate}
                </Text>
              </View>
              <View style={styles.qrMock}>
                <QrCode size={28} color="#0F172A" />
                <Text style={styles.qrText}>Verified</Text>
              </View>
            </View>

            {/* AM Routine Section */}
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
                      {step.category} • <Text style={{ color: "#0284C7" }}>{step.amount}</Text>
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

            {/* PM Routine Section */}
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
                      {step.category} • <Text style={{ color: "#4F46E5" }}>{step.amount}</Text>
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

            {/* Weekly Tracking Grid */}
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

              {/* AM Checkboxes */}
              <View style={styles.gridRow}>
                <Text style={styles.gridLeadText}>AM</Text>
                {cardData.weeklyChecklistDays.map((day) => (
                  <View key={day} style={styles.checkboxMock} />
                ))}
              </View>

              {/* PM Checkboxes */}
              <View style={styles.gridRow}>
                <Text style={styles.gridLeadText}>PM</Text>
                {cardData.weeklyChecklistDays.map((day) => (
                  <View key={day} style={styles.checkboxMock} />
                ))}
              </View>
            </View>

            {/* Paper Footer */}
            <View style={styles.paperFooter}>
              <Text style={styles.paperFooterText}>
                Post on bathroom mirror. Tape at eye-level to maintain consistency.
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
  topActionRow: {
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
