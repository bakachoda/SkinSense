import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  BarChart3,
  Zap,
} from "lucide-react-native";
import type {
  SkinTimeline,
  ConcernTrend,
  TrendDirection,
  Breakpoint,
} from "@skinsense/types";

const { width } = Dimensions.get("window");
const CHART_WIDTH = width - 72;
const CHART_HEIGHT = 100;

interface SkinTimelineChartProps {
  timeline: SkinTimeline;
  windowLabel: string;
}

const CONCERN_COLORS: Record<string, string> = {
  acne: "#EF4444",
  redness: "#F97316",
  pigmentation: "#A855F7",
  texture: "#3B82F6",
  dryness: "#06B6D4",
  oiliness: "#F59E0B",
  skinHealthScore: "#10B981",
};

const DIRECTION_CONFIG: Record<TrendDirection, { icon: any; color: string; label: string }> = {
  improving: { icon: TrendingDown, color: "#10B981", label: "Improving" },
  stable: { icon: Minus, color: "#60A5FA", label: "Stable" },
  declining: { icon: TrendingUp, color: "#EF4444", label: "Declining" },
  volatile: { icon: AlertTriangle, color: "#F59E0B", label: "Volatile" },
};

function MiniSparkline({ dataPoints, color, chartWidth }: { dataPoints: { value: number }[]; color: string; chartWidth?: number }) {
  if (dataPoints.length < 2) return null;

  const w = chartWidth ?? CHART_WIDTH;
  const values = dataPoints.map((dp) => dp.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const pointSpacing = w / (values.length - 1);

  const points = values.map((v, i) => ({
    x: i * pointSpacing,
    y: CHART_HEIGHT - ((v - minVal) / range) * (CHART_HEIGHT - 10) - 5,
  }));

  return (
    <View style={[styles.sparklineContainer, { width: w, height: CHART_HEIGHT }]}>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
        <View
          key={pct}
          style={[
            styles.gridLine,
            { top: pct * CHART_HEIGHT },
          ]}
        />
      ))}

      {/* Line segments */}
      {points.map((point, i) => {
        if (i === 0) return null;
        const prev = points[i - 1]!;
        const dx = point.x - prev.x;
        const dy = point.y - prev.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        return (
          <View
            key={`line-${i}`}
            style={{
              position: "absolute",
              left: prev.x,
              top: prev.y,
              width: length,
              height: 2,
              backgroundColor: color,
              transform: [{ rotate: `${angle}deg` }],
              transformOrigin: "left center",
              opacity: 0.8,
            }}
          />
        );
      })}

      {/* Data points */}
      {points.map((point, i) => (
        <View
          key={`dot-${i}`}
          style={[
            styles.dataPoint,
            {
              left: point.x - 4,
              top: point.y - 4,
              backgroundColor: color,
            },
          ]}
        />
      ))}

      {/* Value labels at start and end */}
      <Text style={[styles.valueLabel, { left: 0, top: points[0]!.y - 18 }]}>
        {values[0]}
      </Text>
      <Text
        style={[
          styles.valueLabel,
          {
            right: 0,
            top: points[points.length - 1]!.y - 18,
            textAlign: "right",
          },
        ]}
      >
        {values[values.length - 1]}
      </Text>
    </View>
  );
}

function TrendBadge({ trend }: { trend: ConcernTrend }) {
  const config = DIRECTION_CONFIG[trend.direction];
  const Icon = config.icon;
  const color = CONCERN_COLORS[trend.concern] || "#9CA3AF";
  const zoneName = trend.zone.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <View style={styles.trendCard}>
      <View style={styles.trendHeader}>
        <View style={[styles.trendDot, { backgroundColor: color }]} />
        <Text style={styles.trendConcern}>
          {trend.concern.charAt(0).toUpperCase() + trend.concern.slice(1)}
        </Text>
        <Text style={styles.trendZone}>{zoneName}</Text>
      </View>

      <MiniSparkline dataPoints={trend.dataPoints} color={color} chartWidth={232} />

      <View style={styles.trendFooter}>
        <View style={[styles.directionBadge, { backgroundColor: `${config.color}15` }]}>
          <Icon size={12} color={config.color} />
          <Text style={[styles.directionText, { color: config.color }]}>
            {config.label}
          </Text>
        </View>
        <Text style={styles.trendDelta}>
          {trend.delta > 0 ? "+" : ""}{trend.delta.toFixed(0)} pts
        </Text>
      </View>
    </View>
  );
}

function BreakpointCard({ bp }: { bp: Breakpoint }) {
  const typeColors = { peak: "#10B981", valley: "#EF4444", inflection: "#F59E0B" };
  const color = typeColors[bp.type];
  const date = new Date(bp.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <View style={styles.breakpointCard}>
      <View style={[styles.breakpointDot, { backgroundColor: color }]} />
      <View style={styles.breakpointInfo}>
        <Text style={styles.breakpointDate}>{date}</Text>
        <Text style={styles.breakpointType}>
          {bp.type.charAt(0).toUpperCase() + bp.type.slice(1)}
          {" · "}
          {bp.valueBefore} → {bp.valueAfter}
        </Text>
        {bp.possibleCause && (
          <Text style={styles.breakpointCause}>{bp.possibleCause}</Text>
        )}
      </View>
    </View>
  );
}

export function SkinTimelineChart({ timeline, windowLabel }: SkinTimelineChartProps) {
  if (timeline.totalScans === 0) {
    return (
      <View style={styles.emptyState}>
        <BarChart3 size={40} color="#374151" />
        <Text style={styles.emptyTitle}>No Timeline Data Yet</Text>
        <Text style={styles.emptySub}>Complete more scans to see your skin evolution over time</Text>
      </View>
    );
  }

  // Overall score sparkline
  const overallColor = "#10B981";
  const firstScore = timeline.overallScoreHistory[0]?.value ?? 0;
  const latestScore = timeline.overallScoreHistory[timeline.overallScoreHistory.length - 1]?.value ?? 0;
  const scoreDelta = latestScore - firstScore;

  // Group trends by zone
  const topTrends = timeline.concernTrends
    .filter((t) => t.confidence > 0.3)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 6);

  return (
    <View style={styles.container}>
      {/* Overall Score Evolution */}
      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <View>
            <Text style={styles.heroTitle}>Skin Health Evolution</Text>
            <Text style={styles.heroSub}>
              {timeline.totalScans} scans · {windowLabel} window
            </Text>
          </View>
          <View style={styles.heroScoreWrap}>
            <Text style={styles.heroScore}>{latestScore}</Text>
            <Text style={[styles.heroDelta, { color: scoreDelta >= 0 ? "#10B981" : "#EF4444" }]}>
              {scoreDelta > 0 ? "+" : ""}{scoreDelta}
            </Text>
          </View>
        </View>

        <MiniSparkline
          dataPoints={timeline.overallScoreHistory}
          color={overallColor}
        />
      </View>

      {/* Top Concern Trends */}
      {topTrends.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Zap size={16} color="#818CF8" />
            <Text style={styles.sectionTitle}>Trending Concerns</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.trendRow}>
              {topTrends.map((trend, i) => (
                <TrendBadge key={`${trend.zone}-${trend.concern}-${i}`} trend={trend} />
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Breakpoints */}
      {timeline.breakpoints.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Moments</Text>
          {timeline.breakpoints.slice(0, 3).map((bp, i) => (
            <BreakpointCard key={i} bp={bp} />
          ))}
        </View>
      )}

      {/* Seasonal Patterns */}
      {timeline.seasonalPatterns.length > 0 && (
        <View style={styles.seasonCard}>
          <Text style={styles.seasonTitle}>🌤 Seasonal Insight</Text>
          <Text style={styles.seasonText}>
            {timeline.seasonalPatterns[0]!.description}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  heroSub: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginTop: 2,
  },
  heroScoreWrap: {
    alignItems: "flex-end",
  },
  heroScore: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
  },
  heroDelta: {
    fontSize: 11,
    fontWeight: "700",
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  trendRow: {
    flexDirection: "row",
    gap: 12,
    paddingRight: 20,
  },
  trendCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 14,
    width: 260,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  trendHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  trendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  trendConcern: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  trendZone: {
    fontSize: 10,
    color: "#6B7280",
    marginLeft: "auto",
    textTransform: "uppercase",
  },
  trendFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  directionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: "#F3F4F6",
  },
  directionText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  trendDelta: {
    fontSize: 11,
    fontWeight: "700",
    color: "#111827",
  },
  breakpointCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  breakpointDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  breakpointInfo: {
    flex: 1,
  },
  breakpointDate: {
    fontSize: 11,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  breakpointType: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
    fontWeight: "600",
  },
  breakpointCause: {
    fontSize: 11,
    color: "#4B5563",
    marginTop: 4,
    lineHeight: 16,
  },
  seasonCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  seasonTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  seasonText: {
    fontSize: 12,
    color: "#4B5563",
    lineHeight: 18,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  emptySub: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  sparklineContainer: {
    position: "relative",
    overflow: "hidden",
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#F3F4F6",
  },
  dataPoint: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  valueLabel: {
    position: "absolute",
    fontSize: 9,
    fontWeight: "700",
    color: "#6B7280",
  },
});
