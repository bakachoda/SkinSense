import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import {
  Users,
  TrendingUp,
  ShoppingBag,
  ChevronRight,
  Star,
} from "lucide-react-native";
import type { SkinTwinResult, PercentileRanking, WhatWorked } from "@skinsense/types";

interface SkinTwinCardProps {
  skinTwin: SkinTwinResult | null;
  onViewDetails?: () => void;
}

function PercentileRing({ ranking }: { ranking: PercentileRanking }) {
  const pct = ranking.percentile;
  const color = pct >= 75 ? "#10B981" : pct >= 50 ? "#60A5FA" : pct >= 25 ? "#F59E0B" : "#EF4444";
  const label = ranking.metric === "skinHealthScore" ? "Health" : "Barrier";

  // Simple ring visualization using borders
  const circumference = 2 * Math.PI * 26;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <View style={styles.ringContainer}>
      <View style={[styles.ringOuter, { borderColor: `${color}30` }]}>
        <View style={[styles.ringProgress, { borderColor: color, borderTopColor: color, borderRightColor: pct > 25 ? color : "transparent", borderBottomColor: pct > 50 ? color : "transparent", borderLeftColor: pct > 75 ? color : "transparent" }]}>
          <View style={styles.ringInner}>
            <Text style={[styles.ringValue, { color }]}>{pct}</Text>
            <Text style={styles.ringUnit}>%ile</Text>
          </View>
        </View>
      </View>
      <Text style={styles.ringLabel}>{label}</Text>
      <Text style={styles.ringDetail}>
        You: {ranking.userValue} · Median: {ranking.cohortMedian}
      </Text>
    </View>
  );
}

function ProductRecommendation({ product }: { product: WhatWorked }) {
  const successPct = Math.round(product.successRate * 100);

  return (
    <View style={styles.productCard}>
      <View style={styles.productLeft}>
        <Text style={styles.productName}>{product.productName}</Text>
        <Text style={styles.productCategory}>{product.productCategory}</Text>
      </View>
      <View style={styles.productRight}>
        <View style={styles.successBadge}>
          <Star size={10} color="#FBBF24" />
          <Text style={styles.successText}>{successPct}% success</Text>
        </View>
        <Text style={styles.productUsers}>
          {product.usersWhoImproved.toLocaleString()} users improved
        </Text>
      </View>
    </View>
  );
}

export function SkinTwinCard({ skinTwin, onViewDetails }: SkinTwinCardProps) {
  if (!skinTwin || skinTwin.rankings.length === 0) {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Users size={20} color="#818CF8" />
          <Text style={styles.cardTitle}>Skin Twin</Text>
        </View>
        <Text style={styles.emptyText}>
          Complete more scans to unlock your Skin Twin cohort comparison
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.iconWrap}>
            <Users size={18} color="#818CF8" />
          </View>
          <View>
            <Text style={styles.cardTitle}>Skin Twin</Text>
            <Text style={styles.cohortInfo}>
              Fitzpatrick {skinTwin.cohort.fitzpatrick} · {skinTwin.cohort.ageRange} ·{" "}
              {skinTwin.cohort.cohortSize.toLocaleString()} users
            </Text>
          </View>
        </View>
        <View style={styles.confidenceBadge}>
          <Text style={styles.confidenceText}>
            {Math.round(skinTwin.matchConfidence * 100)}% match
          </Text>
        </View>
      </View>

      {/* Percentile Rankings */}
      <View style={styles.rankingsRow}>
        {skinTwin.rankings.map((r) => (
          <PercentileRing key={r.metric} ranking={r} />
        ))}
      </View>

      {/* What Worked */}
      {skinTwin.whatWorked.length > 0 && (
        <View style={styles.whatWorkedSection}>
          <View style={styles.whatWorkedHeader}>
            <ShoppingBag size={14} color="#9CA3AF" />
            <Text style={styles.whatWorkedTitle}>What Worked for Your Twins</Text>
          </View>
          {skinTwin.whatWorked.slice(0, 3).map((product, i) => (
            <ProductRecommendation key={i} product={product} />
          ))}
        </View>
      )}

      {onViewDetails && (
        <TouchableOpacity onPress={onViewDetails} style={styles.viewMoreBtn}>
          <Text style={styles.viewMoreText}>View Full Comparison</Text>
          <ChevronRight size={16} color="#818CF8" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1F2937",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#374151",
    gap: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(129, 140, 248, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F9FAFB",
  },
  cohortInfo: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
  },
  confidenceBadge: {
    backgroundColor: "rgba(129, 140, 248, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#818CF8",
  },
  emptyText: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    paddingVertical: 12,
  },
  rankingsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  ringContainer: {
    alignItems: "center",
    gap: 6,
  },
  ringOuter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  ringProgress: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  ringInner: {
    alignItems: "center",
  },
  ringValue: {
    fontSize: 18,
    fontWeight: "800",
  },
  ringUnit: {
    fontSize: 9,
    color: "#6B7280",
    fontWeight: "500",
  },
  ringLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#D1D5DB",
  },
  ringDetail: {
    fontSize: 10,
    color: "#6B7280",
  },
  whatWorkedSection: {
    gap: 8,
  },
  whatWorkedHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  whatWorkedTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  productCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#374151",
  },
  productLeft: {
    flex: 1,
  },
  productName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#F9FAFB",
  },
  productCategory: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
  },
  productRight: {
    alignItems: "flex-end",
  },
  successBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(251, 191, 36, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  successText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FBBF24",
  },
  productUsers: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 3,
  },
  viewMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#374151",
  },
  viewMoreText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#818CF8",
  },
});
