import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Sparkles, Scan, Sparkle, AlertTriangle } from "lucide-react-native";

// ──────────────────────────────────────────────
// 1. Circular Progress Ring (Scan Upload)
// ──────────────────────────────────────────────

interface CircularProgressProps {
  progress: number; // 0 to 100
  label?: string;
}

export function CircularProgressRing({ progress, label = "Uploading your scan..." }: CircularProgressProps) {
  const size = 140;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * Math.min(100, Math.max(0, progress))) / 100;

  return (
    <View style={styles.ringContainer} accessibilityRole="progressbar" accessibilityValue={{ now: Math.round(progress), min: 0, max: 100 }}>
      <Svg width={size} height={size}>
        {/* Background Track */}
        <Circle
          stroke="#1e293b"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Animated Progress Ring */}
        <Circle
          stroke="#06b6d4"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.ringTextWrapper}>
        <Text style={styles.ringPercentage}>{Math.round(progress)}%</Text>
      </View>
      <Text style={styles.ringLabel}>{label}</Text>
    </View>
  );
}

// ──────────────────────────────────────────────
// 2. Three-Stage Progressive Analysis Indicator
// ──────────────────────────────────────────────

interface AnalysisProgressProps {
  serverStage?: string; // from WebSocket
  onTimeoutWait?: () => void;
  onTimeoutHome?: () => void;
}

export function AnalysisProgress({
  serverStage,
  onTimeoutWait,
  onTimeoutHome,
}: AnalysisProgressProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute stage: 0-10s stage 1, 10-20s stage 2, 20-30s stage 3, or override by serverStage
  let activeStage = 1;
  if (serverStage === "detection" || (elapsedSeconds >= 10 && elapsedSeconds < 20)) {
    activeStage = 2;
  } else if (serverStage === "scoring" || serverStage === "routine" || elapsedSeconds >= 20) {
    activeStage = 3;
  }

  // 60-second inference timeout UI
  if (elapsedSeconds >= 60) {
    return (
      <View style={styles.timeoutCard}>
        <AlertTriangle size={36} color="#f59e0b" style={{ marginBottom: 12 }} />
        <Text style={styles.timeoutTitle}>Analysis Taking Too Long</Text>
        <Text style={styles.timeoutBody}>
          Our servers are under heavy load. Your scan has been queued and you&apos;ll get a notification when results are ready.
        </Text>
        <View style={styles.timeoutActions}>
          <TouchableOpacity
            style={styles.timeoutSecondaryBtn}
            onPress={onTimeoutHome}
            accessibilityLabel="Go to Home"
          >
            <Text style={styles.timeoutSecondaryText}>Go to Home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.timeoutPrimaryBtn}
            onPress={onTimeoutWait}
            accessibilityLabel="Wait for results"
          >
            <Text style={styles.timeoutPrimaryText}>Wait</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.stagesContainer}>
      {/* Visual Icon */}
      <View style={styles.iconPulseWrapper}>
        {activeStage === 1 && <Scan size={44} color="#06b6d4" />}
        {activeStage === 2 && <Sparkle size={44} color="#3b82f6" />}
        {activeStage === 3 && <Sparkles size={44} color="#10b981" />}
      </View>

      {/* Stepper indicator dots */}
      <View style={styles.stepsRow}>
        <View style={[styles.stepDot, activeStage >= 1 && styles.stepDotActive]} />
        <View style={[styles.stepLine, activeStage >= 2 && styles.stepLineActive]} />
        <View style={[styles.stepDot, activeStage >= 2 && styles.stepDotActive]} />
        <View style={[styles.stepLine, activeStage >= 3 && styles.stepLineActive]} />
        <View style={[styles.stepDot, activeStage >= 3 && styles.stepDotActive]} />
      </View>

      {/* Stage Label */}
      <Text style={styles.stageTitle}>
        {activeStage === 1 && "Mapping your face..."}
        {activeStage === 2 && "Detecting concerns..."}
        {activeStage === 3 && "Building your routine..."}
      </Text>
      <Text style={styles.stageSubtitle}>
        {activeStage === 1 && "Segmenting facial zones and measuring lighting variance"}
        {activeStage === 2 && "Evaluating papules, texture roughness, and redness patches"}
        {activeStage === 3 && "Matching safe, allergen-free active ingredients"}
      </Text>

      {/* 30-second delay hint */}
      {elapsedSeconds >= 30 && (
        <Text style={styles.delayNotice}>Taking longer than expected...</Text>
      )}
    </View>
  );
}

// ──────────────────────────────────────────────
// 3. Product Catalog Skeleton Cards
// ──────────────────────────────────────────────

export function ProductSkeleton() {
  return (
    <View style={styles.skeletonGrid}>
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={styles.skeletonCard}>
          <View style={styles.skeletonImage} />
          <View style={styles.skeletonTextLong} />
          <View style={styles.skeletonTextMedium} />
          <View style={styles.skeletonTextShort} />
        </View>
      ))}
    </View>
  );
}

// ──────────────────────────────────────────────
// 4. Routine Step Shimmer Card
// ──────────────────────────────────────────────

export function RoutineShimmer() {
  return (
    <View style={styles.routineShimmerWrapper}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.routineShimmerCard}>
          <View style={styles.routineShimmerBadge} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={styles.skeletonTextMedium} />
            <View style={[styles.skeletonTextLong, { marginTop: 6 }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  ringContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 24,
  },
  ringTextWrapper: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    top: 0,
    bottom: 30,
    left: 0,
    right: 0,
  },
  ringPercentage: {
    color: "#f8fafc",
    fontSize: 28,
    fontWeight: "700",
  },
  ringLabel: {
    color: "#94a3b8",
    fontSize: 14,
    marginTop: 16,
    fontWeight: "500",
  },

  stagesContainer: {
    alignItems: "center",
    padding: 24,
  },
  iconPulseWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(6, 182, 212, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  stepsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#334155",
  },
  stepDotActive: {
    backgroundColor: "#06b6d4",
  },
  stepLine: {
    width: 32,
    height: 2,
    backgroundColor: "#334155",
  },
  stepLineActive: {
    backgroundColor: "#06b6d4",
  },
  stageTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
  },
  stageSubtitle: {
    color: "#94a3b8",
    fontSize: 13,
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 18,
  },
  delayNotice: {
    color: "#fbbf24",
    fontSize: 12,
    marginTop: 16,
    fontStyle: "italic",
  },

  timeoutCard: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginHorizontal: 16,
  },
  timeoutTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  timeoutBody: {
    color: "#94a3b8",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 20,
  },
  timeoutActions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  timeoutSecondaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#334155",
    alignItems: "center",
  },
  timeoutSecondaryText: {
    color: "#f8fafc",
    fontWeight: "600",
    fontSize: 14,
  },
  timeoutPrimaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#06b6d4",
    alignItems: "center",
  },
  timeoutPrimaryText: {
    color: "#0f172a",
    fontWeight: "700",
    fontSize: 14,
  },

  skeletonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    padding: 16,
  },
  skeletonCard: {
    width: "48%",
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 12,
  },
  skeletonImage: {
    height: 100,
    backgroundColor: "#334155",
    borderRadius: 8,
    marginBottom: 10,
  },
  skeletonTextLong: {
    height: 12,
    backgroundColor: "#334155",
    borderRadius: 4,
    width: "85%",
    marginBottom: 6,
  },
  skeletonTextMedium: {
    height: 10,
    backgroundColor: "#334155",
    borderRadius: 4,
    width: "60%",
    marginBottom: 6,
  },
  skeletonTextShort: {
    height: 10,
    backgroundColor: "#334155",
    borderRadius: 4,
    width: "35%",
  },

  routineShimmerWrapper: {
    padding: 16,
    gap: 12,
  },
  routineShimmerCard: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  routineShimmerBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#334155",
  },
});
