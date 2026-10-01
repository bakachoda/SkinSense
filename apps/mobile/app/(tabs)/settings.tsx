import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
} from "react-native";
import { useQuestionnaireStore } from "../../stores/questionnaire";
import { QuestionnaireWizard } from "../../components/QuestionnaireWizard";
import {
  User,
  Shield,
  Sparkles,
  Edit3,
  Server,
  Database,
  CheckCircle,
  X,
} from "lucide-react-native";

export default function SettingsScreen() {
  const { questionnaire, resetQuestionnaire } = useQuestionnaireStore();
  const [showWizard, setShowWizard] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>
            Manage your clinical skin profile & preferences
          </Text>
        </View>

        {/* Skin Profile Card (Section 2.2) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <User size={20} color="#10B981" />
              <Text style={styles.cardTitle}>Dermatological Profile</Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setShowWizard(true)}
            >
              <Edit3 size={15} color="#3B82F6" />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Skin Type</Text>
            <Text style={styles.profileValue}>{questionnaire.skinType || "Combination"}</Text>
          </View>

          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Primary Concerns</Text>
            <Text style={styles.profileValue}>
              {questionnaire.concerns.join(", ") || "None"}
            </Text>
          </View>

          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Allergies Excluded</Text>
            <Text style={styles.profileValue}>
              {questionnaire.allergies.length > 0
                ? questionnaire.allergies.join(", ")
                : "None recorded"}
            </Text>
          </View>

          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Age Demographic</Text>
            <Text style={styles.profileValue}>{questionnaire.ageRange || "20s"}</Text>
          </View>

          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Pregnancy Safety Mode</Text>
            <Text style={[styles.profileValue, questionnaire.isPregnant && { color: "#F59E0B" }]}>
              {questionnaire.isPregnant ? "Active (Contraindications Excluded)" : "Inactive"}
            </Text>
          </View>
        </View>

        {/* Retake Questionnaire CTA */}
        <TouchableOpacity
          style={styles.retakeCard}
          onPress={() => setShowWizard(true)}
          activeOpacity={0.8}
        >
          <Sparkles size={22} color="#10B981" />
          <View style={{ flex: 1 }}>
            <Text style={styles.retakeTitle}>Retake Diagnostic Quiz</Text>
            <Text style={styles.retakeSub}>
              Update your skin concerns and sensitivities for upcoming scans
            </Text>
          </View>
        </TouchableOpacity>

        {/* System & Architecture Status */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Server size={18} color="#60A5FA" />
            <Text style={styles.cardTitle}>System Architecture (Phase 1 MVP)</Text>
          </View>

          <View style={styles.statusItem}>
            <Database size={16} color="#10B981" />
            <Text style={styles.statusLabel}>PostgreSQL 16 Engine</Text>
            <Text style={styles.statusValue}>Online & GIN-Indexed</Text>
          </View>

          <View style={styles.statusItem}>
            <Server size={16} color="#10B981" />
            <Text style={styles.statusLabel}>Redis 7 BullMQ Pipeline</Text>
            <Text style={styles.statusValue}>Healthy (6379)</Text>
          </View>

          <View style={styles.statusItem}>
            <CheckCircle size={16} color="#10B981" />
            <Text style={styles.statusLabel}>Socket.IO Gateway</Text>
            <Text style={styles.statusValue}>Port 3000 Active</Text>
          </View>
        </View>

        <View style={styles.versionRow}>
          <Text style={styles.versionText}>SkinSense HealthOS • Phase 1 MVP Core Loop</Text>
        </View>
      </ScrollView>

      {/* Edit Questionnaire Modal */}
      <Modal visible={showWizard} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: "#0B0F17" }}>
          <View style={styles.modalTopBar}>
            <Text style={styles.modalTopTitle}>Edit Skin Profile</Text>
            <TouchableOpacity onPress={() => setShowWizard(false)}>
              <X size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
          <QuestionnaireWizard onComplete={() => setShowWizard(false)} />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0F17",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#F9FAFB",
  },
  subtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#161E2E",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1F2937",
    padding: 20,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F9FAFB",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  editButtonText: {
    color: "#60A5FA",
    fontSize: 13,
    fontWeight: "600",
  },
  profileRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
  },
  profileLabel: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  profileValue: {
    color: "#F3F4F6",
    fontWeight: "600",
    fontSize: 14,
    maxWidth: "50%",
    textAlign: "right",
  },
  retakeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161E2E",
    borderWidth: 1,
    borderColor: "#10B981",
    borderRadius: 16,
    padding: 18,
    gap: 14,
    marginBottom: 16,
  },
  retakeTitle: {
    color: "#F9FAFB",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  retakeSub: {
    color: "#9CA3AF",
    fontSize: 12,
    lineHeight: 16,
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
  },
  statusLabel: {
    flex: 1,
    color: "#D1D5DB",
    fontSize: 13,
  },
  statusValue: {
    color: "#10B981",
    fontSize: 12,
    fontWeight: "600",
  },
  versionRow: {
    alignItems: "center",
    marginTop: 20,
  },
  versionText: {
    color: "#4B5563",
    fontSize: 12,
  },
  modalTopBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
  },
  modalTopTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F9FAFB",
  },
});
