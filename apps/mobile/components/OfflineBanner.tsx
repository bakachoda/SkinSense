import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { WifiOff, RefreshCw, CheckCircle2 } from "lucide-react-native";
import { useOfflineSync } from "../lib/useOfflineSync";

export interface OfflineBannerProps {
  isOffline?: boolean;
  queuedCount?: number;
  isSyncing?: boolean;
  onSyncPress?: () => void;
  onToggleSimulate?: () => void;
}

export function OfflineBanner(props: OfflineBannerProps) {
  const sync = useOfflineSync();

  const isOffline = props.isOffline !== undefined ? props.isOffline : sync.isOffline;
  const queuedCount = props.queuedCount !== undefined ? props.queuedCount : sync.queuedCount;
  const isSyncing = props.isSyncing !== undefined ? props.isSyncing : sync.isSyncing;
  const onSyncPress = props.onSyncPress || sync.flushQueue;
  const onToggleSimulate = props.onToggleSimulate || sync.toggleSimulateOffline;

  if (!isOffline && queuedCount === 0) return null;

  return (
    <View style={[styles.container, isOffline ? styles.offlineBg : styles.syncingBg]}>
      <View style={styles.leftRow}>
        {isOffline ? (
          <WifiOff size={15} color="#991B1B" />
        ) : (
          <CheckCircle2 size={15} color="#065F46" />
        )}
        <View>
          <Text style={[styles.title, isOffline ? styles.offlineText : styles.syncingText]}>
            {isOffline ? "OFFLINE RESILIENCE ACTIVE" : "PENDING SYNC"}
          </Text>
          <Text style={styles.subtitle}>
            {isOffline
              ? `${queuedCount} change${queuedCount === 1 ? "" : "s"} cached locally`
              : `${queuedCount} change${queuedCount === 1 ? "" : "s"} pending upload`}
          </Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        {onSyncPress && !isOffline && (
          <TouchableOpacity
            style={styles.syncBtn}
            onPress={onSyncPress}
            disabled={isSyncing}
          >
            <RefreshCw
              size={13}
              color="#FFFFFF"
              style={isSyncing ? { transform: [{ rotate: "45deg" }] } : undefined}
            />
            <Text style={styles.syncBtnText}>{isSyncing ? "Syncing..." : "Sync"}</Text>
          </TouchableOpacity>
        )}

        {onToggleSimulate && (
          <TouchableOpacity style={styles.testBtn} onPress={onToggleSimulate}>
            <Text style={styles.testBtnText}>
              {isOffline ? "Go Online" : "Simulate Offline"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    borderWidth: 1,
  },
  offlineBg: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  syncingBg: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  leftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  title: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  offlineText: {
    color: "#991B1B",
  },
  syncingText: {
    color: "#065F46",
  },
  subtitle: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 1,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  syncBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#0F172A",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  syncBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  testBtn: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  testBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
  },
});
