import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { GitCompare, Calendar, ArrowRight, CheckCircle2 } from "lucide-react-native";

interface BeforeAfterSliderProps {
  beforeLabel?: string;
  afterLabel?: string;
  metrics?: { label: string; change: string; positive: boolean }[];
}

const DEFAULT_METRICS = [
  { label: "Cheek Erythema", change: "-18%", positive: true },
  { label: "Hydration Barrier", change: "+22%", positive: true },
  { label: "T-Zone Sebum", change: "-14%", positive: true },
];

const TIMELINE_POINTS = [
  { label: "Sep 14", sub: "Baseline", active: true },
  { label: "Sep 21", sub: "Wk 1", active: false },
  { label: "Sep 28", sub: "Wk 2", active: false },
  { label: "Oct 01", sub: "Today", active: true },
];

export function BeforeAfterSlider({
  beforeLabel = "Sep 14 (Baseline)",
  afterLabel = "Oct 01 (Today)",
  metrics = DEFAULT_METRICS,
}: BeforeAfterSliderProps) {
  // Slider position from 0 to 1 (default 50% split)
  const [sliderPos, setSliderPos] = useState(0.5);
  const containerWidthRef = useRef(300);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const width = containerWidthRef.current;
        const newX = gestureState.moveX - 40; // account for margin
        const ratio = Math.max(0.1, Math.min(0.9, newX / width));
        setSliderPos(ratio);
      },
    }),
  ).current;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <GitCompare size={18} color="#0F172A" />
          <Text style={styles.title}>Landmark-Aligned Comparison</Text>
        </View>
        <View style={styles.statusPill}>
          <CheckCircle2 size={12} color="#059669" />
          <Text style={styles.statusText}>Homography Aligned</Text>
        </View>
      </View>

      <Text style={styles.subtitle}>
        Drag the vertical divider to evaluate clinical stratum corneum resolution over time.
      </Text>

      {/* Comparison Canvas */}
      <View
        style={styles.canvasContainer}
        onLayout={(e) => {
          containerWidthRef.current = e.nativeEvent.layout.width;
        }}
      >
        {/* Left Side: Before Image Simulator */}
        <View
          style={[
            styles.splitHalf,
            styles.beforeSide,
            { width: `${Math.round(sliderPos * 100)}%` },
          ]}
        >
          <View style={styles.sideBadgeWrap}>
            <View style={styles.sideBadge}>
              <Text style={styles.sideBadgeText}>BEFORE</Text>
            </View>
          </View>
          <View style={styles.visualPlaceholder}>
            <View style={styles.erythemaPatch} />
            <Text style={styles.visualLabel}>{beforeLabel}</Text>
          </View>
        </View>

        {/* Right Side: After Image Simulator */}
        <View style={[styles.splitHalf, styles.afterSide]}>
          <View style={[styles.sideBadgeWrap, { alignItems: "flex-end" }]}>
            <View style={[styles.sideBadge, styles.afterBadge]}>
              <Text style={[styles.sideBadgeText, styles.afterBadgeText]}>AFTER</Text>
            </View>
          </View>
          <View style={styles.visualPlaceholder}>
            <View style={[styles.erythemaPatch, styles.erythemaResolved]} />
            <Text style={styles.visualLabel}>{afterLabel}</Text>
          </View>
        </View>

        {/* Draggable Divider Bar */}
        <View
          style={[styles.dividerLine, { left: `${Math.round(sliderPos * 100)}%` }]}
          {...panResponder.panHandlers}
        >
          <View style={styles.handleKnob}>
            <View style={styles.knobGrip} />
            <View style={styles.knobGrip} />
          </View>
        </View>
      </View>

      {/* Comparison Metrics */}
      <View style={styles.metricsRow}>
        {metrics.map((m, i) => (
          <View key={i} style={styles.metricCard}>
            <Text style={styles.metricLabel}>{m.label}</Text>
            <Text
              style={[
                styles.metricChange,
                { color: m.positive ? "#059669" : "#DC2626" },
              ]}
            >
              {m.change}
            </Text>
          </View>
        ))}
      </View>

      {/* Timeline Scrubber Points */}
      <View style={styles.timelineScrubber}>
        <View style={styles.timelineTrack} />
        <View style={styles.timelinePointsRow}>
          {TIMELINE_POINTS.map((pt, idx) => (
            <View key={idx} style={styles.timelinePointCol}>
              <View
                style={[
                  styles.timelineDot,
                  pt.active && styles.timelineDotActive,
                ]}
              />
              <Text style={styles.timelineDate}>{pt.label}</Text>
              <Text style={styles.timelineSub}>{pt.sub}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#059669",
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
    marginBottom: 12,
  },
  canvasContainer: {
    height: 200,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  splitHalf: {
    position: "absolute",
    top: 0,
    bottom: 0,
    overflow: "hidden",
  },
  beforeSide: {
    left: 0,
    backgroundColor: "#F8FAFC",
    borderRightWidth: 1,
    borderRightColor: "#CBD5E1",
    zIndex: 2,
  },
  afterSide: {
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    zIndex: 1,
  },
  sideBadgeWrap: {
    padding: 10,
  },
  sideBadge: {
    backgroundColor: "#475569",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  sideBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  afterBadge: {
    backgroundColor: "#0284C7",
  },
  afterBadgeText: {
    color: "#FFFFFF",
  },
  visualPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 20,
  },
  erythemaPatch: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(239, 68, 68, 0.45)",
    marginBottom: 8,
  },
  erythemaResolved: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    width: 35,
    height: 35,
    borderRadius: 20,
  },
  visualLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  dividerLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: "#0F172A",
    zIndex: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -1.5,
  },
  handleKnob: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  knobGrip: {
    width: 2,
    height: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 1,
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 14,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  metricLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
    textAlign: "center",
  },
  metricChange: {
    fontSize: 15,
    fontWeight: "800",
    marginTop: 2,
  },
  timelineScrubber: {
    marginTop: 16,
    position: "relative",
    paddingVertical: 10,
  },
  timelineTrack: {
    position: "absolute",
    top: 17,
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: "#E2E8F0",
  },
  timelinePointsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timelinePointCol: {
    alignItems: "center",
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#CBD5E1",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    marginBottom: 4,
  },
  timelineDotActive: {
    backgroundColor: "#0284C7",
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  timelineDate: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1E293B",
  },
  timelineSub: {
    fontSize: 10,
    color: "#64748B",
  },
});
