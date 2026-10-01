import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuestionnaireStore } from "../../stores/questionnaire";
import { apiClient } from "../../lib/api-client";
import {
  Camera,
  TrendingUp,
  Sparkles,
  Calendar,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react-native";
import { NoScansEmptyState } from "../../components/EmptyStates";

export default function HomeScreen() {
  const router = useRouter();
  const { questionnaire, hasCompletedQuestionnaire } = useQuestionnaireStore();
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadScans = async () => {
    try {
      const res = await apiClient.getScans();
      setScans(res.scans || []);
    } catch {
      // Mock scans for preview if offline
      setScans([
        {
          id: "scan-prev-1",
          status: "COMPLETED",
          createdAt: new Date().toISOString(),
          result: {
            skinHealthScore: 78,
            modelVersion: "v1.0",
          },
        },
        {
          id: "scan-prev-2",
          status: "COMPLETED",
          createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
          result: {
            skinHealthScore: 72,
            modelVersion: "v1.0",
          },
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadScans();
  }, []);

  const latestScan = scans.find((s) => s.result);
  const latestScore = latestScan?.result?.skinHealthScore ?? 78;

  const getScoreColor = (score: number) => {
    if (score >= 75) return "#10B981";
    if (score >= 50) return "#F59E0B";
    return "#EF4444";
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadScans();
            }}
            tintColor="#10B981"
          />
        }
      >
        {/* Welcome Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>SkinSense HealthOS</Text>
          <Text style={styles.subGreeting}>
            Clinical facial analysis & dynamic regimen
          </Text>
        </View>

        {/* Big CTA: Capture Scan */}
        <TouchableOpacity
          style={styles.heroScanCard}
          onPress={() => router.push("/(tabs)/scan")}
          activeOpacity={0.85}
        >
          <View style={styles.heroTextCol}>
            <Text style={styles.heroTitle}>New Skin Analysis</Text>
            <Text style={styles.heroSub}>
              Take a front photo with real-time zone detection & quality checks
            </Text>
            <View style={styles.heroBadge}>
              <Sparkles size={14} color="#10B981" />
              <Text style={styles.heroBadgeText}>AI Camera Guide Ready</Text>
            </View>
          </View>
          <View style={styles.cameraIconCircle}>
            <Camera size={26} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {/* Current Skin Health Metric Card */}
        <View style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View>
              <Text style={styles.statLabel}>Latest Skin Health</Text>
              <View style={styles.scoreRow}>
                <Text style={[styles.statValue, { color: getScoreColor(latestScore) }]}>
                  {latestScore}
                </Text>
                <Text style={styles.statMax}>/100</Text>
              </View>
            </View>
            <View style={styles.statBadge}>
              <TrendingUp size={16} color="#10B981" />
              <Text style={styles.statBadgeText}>+6 pts improvement</Text>
            </View>
          </View>

          <View style={styles.profileTagsRow}>
            <View style={styles.tagBadge}>
              <Text style={styles.tagText}>
                Type: {questionnaire.skinType || "Combination"}
              </Text>
            </View>
            <View style={styles.tagBadge}>
              <Text style={styles.tagText}>
                Top: {questionnaire.concerns[0] || "Acne"}
              </Text>
            </View>
            <View style={styles.tagBadge}>
              <Text style={styles.tagText}>
                Age: {questionnaire.ageRange || "20s"}
              </Text>
            </View>
          </View>
        </View>

        {/* Scan History Section (Section 7.1) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Scan History</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/progress")}>
              <Text style={styles.sectionAction}>Compare Scans</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="small" color="#10B981" style={{ marginVertical: 20 }} />
          ) : scans.length === 0 ? (
            <NoScansEmptyState onTakeScan={() => router.push("/(tabs)/scan")} />
          ) : (
            <View style={styles.historyList}>
              {scans.map((scan, idx) => {
                const scanDate = new Date(scan.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
                const score = scan.result?.skinHealthScore ?? 75;
                const prevScore = scans[idx + 1]?.result?.skinHealthScore;
                const delta = prevScore !== undefined ? score - prevScore : null;

                return (
                  <TouchableOpacity
                    key={scan.id}
                    style={styles.historyItem}
                    onPress={() => router.push("/(tabs)/scan")}
                    activeOpacity={0.7}
                  >
                    <View style={styles.dateCircle}>
                      <Calendar size={18} color="#9CA3AF" />
                    </View>
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyDate}>{scanDate}</Text>
                      <Text style={styles.historyStatus}>
                        {scan.status === "COMPLETED" ? "Full analysis complete" : scan.status}
                      </Text>
                    </View>
                    <View style={styles.historyScoreBox}>
                      <Text style={[styles.historyScoreText, { color: getScoreColor(score) }]}>
                        {score}
                      </Text>
                      {delta !== null && (
                        <Text style={[styles.deltaText, { color: delta >= 0 ? "#10B981" : "#EF4444" }]}>
                          {delta >= 0 ? `+${delta}` : `${delta}`}
                        </Text>
                      )}
                    </View>
                    <ChevronRight size={18} color="#4B5563" />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
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
  greeting: {
    fontSize: 26,
    fontWeight: "800",
    color: "#F9FAFB",
    letterSpacing: -0.5,
  },
  subGreeting: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 4,
  },
  heroScanCard: {
    flexDirection: "row",
    backgroundColor: "#161E2E",
    borderWidth: 1.5,
    borderColor: "#10B981",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  heroTextCol: {
    flex: 1,
    paddingRight: 14,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 13,
    color: "#9CA3AF",
    lineHeight: 18,
    marginBottom: 10,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  heroBadgeText: {
    color: "#10B981",
    fontSize: 12,
    fontWeight: "600",
  },
  cameraIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
  },
  statsCard: {
    backgroundColor: "#161E2E",
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  statLabel: {
    fontSize: 13,
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: "600",
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginTop: 4,
  },
  statValue: {
    fontSize: 42,
    fontWeight: "800",
  },
  statMax: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "600",
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statBadgeText: {
    color: "#10B981",
    fontSize: 13,
    fontWeight: "600",
  },
  profileTagsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#1F2937",
    paddingTop: 14,
  },
  tagBadge: {
    backgroundColor: "#1F2937",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  tagText: {
    color: "#D1D5DB",
    fontSize: 12,
    fontWeight: "500",
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F9FAFB",
  },
  sectionAction: {
    color: "#60A5FA",
    fontSize: 13,
    fontWeight: "600",
  },
  emptyCard: {
    backgroundColor: "#161E2E",
    padding: 24,
    borderRadius: 14,
    alignItems: "center",
  },
  emptyText: {
    color: "#F3F4F6",
    fontSize: 15,
    fontWeight: "600",
  },
  emptySub: {
    color: "#9CA3AF",
    fontSize: 13,
    marginTop: 4,
  },
  historyList: {
    gap: 10,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161E2E",
    borderWidth: 1,
    borderColor: "#1F2937",
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  dateCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1F2937",
    justifyContent: "center",
    alignItems: "center",
  },
  historyInfo: {
    flex: 1,
  },
  historyDate: {
    fontSize: 15,
    fontWeight: "600",
    color: "#F9FAFB",
  },
  historyStatus: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  historyScoreBox: {
    alignItems: "flex-end",
  },
  historyScoreText: {
    fontSize: 18,
    fontWeight: "700",
  },
  deltaText: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
});
