import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from "react-native";
import {
  ShieldCheck,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  FileText,
  BookOpen,
  Award,
  Users,
} from "lucide-react-native";

interface SkinHealthScoreCardProps {
  score?: number;
  delta?: number;
  breakdown?: {
    hydration: number;
    barrierHealth: number;
    oilBalance: number;
    inflammation: number;
    pigmentation: number;
    texture: number;
    microbiome: number;
  };
  onOpenReport?: () => void;
  onOpenDiary?: () => void;
}

const DEFAULT_BREAKDOWN = {
  hydration: 82,
  barrierHealth: 78,
  oilBalance: 88,
  inflammation: 72,
  pigmentation: 75,
  texture: 80,
  microbiome: 76,
};

export function SkinHealthScoreCard({
  score = 84,
  delta = 3,
  breakdown = DEFAULT_BREAKDOWN,
  onOpenReport,
  onOpenDiary,
}: SkinHealthScoreCardProps) {
  const [expanded, setExpanded] = useState(false);

  const deltaPositive = delta >= 0;
  const deltaColor = deltaPositive ? "#059669" : "#DC2626";

  const dimensions = [
    { label: "Cutaneous Hydration", val: breakdown.hydration, color: "#0284C7" },
    { label: "Barrier Integrity (TEWL)", val: breakdown.barrierHealth, color: "#059669" },
    { label: "Sebum & Oil Balance", val: breakdown.oilBalance, color: "#D97706" },
    { label: "Inflammation Control", val: breakdown.inflammation, color: "#EF4444" },
    { label: "Melanin Homogeneity", val: breakdown.pigmentation, color: "#8B5CF6" },
    { label: "Surface Texture Regularity", val: breakdown.texture, color: "#06B6D4" },
    { label: "Microbial Balance", val: breakdown.microbiome, color: "#10B981" },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <ShieldCheck size={18} color="#0284C7" />
          <Text style={styles.title}>Skin Health Index</Text>
        </View>
        <View style={styles.peerBadge}>
          <Users size={12} color="#0369A1" />
          <Text style={styles.peerText}>Top 26% of cohort</Text>
        </View>
      </View>

      {/* Main Score Row */}
      <View style={styles.scoreRow}>
        <View style={styles.scoreValueWrap}>
          <Text style={styles.scoreNumber}>{score}</Text>
          <Text style={styles.scoreOutOf}>/100</Text>
        </View>

        <View style={styles.deltaBadge}>
          <TrendingUp size={14} color={deltaColor} />
          <Text style={[styles.deltaText, { color: deltaColor }]}>
            {deltaPositive ? `+${delta}` : delta} pts this week
          </Text>
        </View>
      </View>

      <Text style={styles.scoreDescription}>
        Multi-spectral clinical index integrating epidermal hydration, vascular erythema, barrier resilience, and surface micro-relief.
      </Text>

      {/* Expand/Collapse Toggle */}
      <TouchableOpacity
        style={styles.expandToggle}
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.expandText}>
          {expanded ? "Hide 7-Dimension Breakdown" : "View 7-Dimension Breakdown"}
        </Text>
        {expanded ? (
          <ChevronUp size={16} color="#64748B" />
        ) : (
          <ChevronDown size={16} color="#64748B" />
        )}
      </TouchableOpacity>

      {/* 7-Dimension Breakdown */}
      {expanded && (
        <View style={styles.breakdownList}>
          {dimensions.map((dim, idx) => (
            <View key={idx} style={styles.dimRow}>
              <View style={styles.dimHeader}>
                <Text style={styles.dimLabel}>{dim.label}</Text>
                <Text style={styles.dimVal}>{dim.val}/100</Text>
              </View>
              <View style={styles.dimTrack}>
                <View
                  style={[
                    styles.dimFill,
                    { width: `${dim.val}%`, backgroundColor: dim.color },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Action CTA Buttons */}
      <View style={styles.actionRow}>
        {onOpenReport && (
          <TouchableOpacity style={styles.reportBtn} onPress={onOpenReport}>
            <FileText size={15} color="#0F172A" />
            <Text style={styles.reportBtnText}>Clinical Report</Text>
          </TouchableOpacity>
        )}

        {onOpenDiary && (
          <TouchableOpacity style={styles.diaryBtn} onPress={onOpenDiary}>
            <BookOpen size={15} color="#0284C7" />
            <Text style={styles.diaryBtnText}>Skin Diary</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  titleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.2,
  },
  peerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  peerText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0369A1",
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  scoreValueWrap: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  scoreNumber: {
    fontSize: 44,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -1,
  },
  scoreOutOf: {
    fontSize: 16,
    fontWeight: "600",
    color: "#94A3B8",
  },
  deltaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  deltaText: {
    fontSize: 13,
    fontWeight: "700",
  },
  scoreDescription: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
    marginBottom: 10,
  },
  expandToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  expandText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  breakdownList: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    gap: 10,
  },
  dimRow: {
    gap: 4,
  },
  dimHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dimLabel: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "500",
  },
  dimVal: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
  },
  dimTrack: {
    height: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 3,
    overflow: "hidden",
  },
  dimFill: {
    height: 6,
    borderRadius: 3,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  reportBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingVertical: 10,
    borderRadius: 10,
  },
  reportBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  diaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#F0F9FF",
    borderWidth: 1,
    borderColor: "#BAE6FD",
    paddingVertical: 10,
    borderRadius: 10,
  },
  diaryBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0284C7",
  },
});
