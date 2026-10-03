import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { AlertOctagon, CheckCircle2, AlertTriangle, UserCheck } from "lucide-react-native";
import type { SafetyScreeningResult } from "@skinsense/types";

interface SafetyScreeningCardProps {
  safetyResults?: SafetyScreeningResult[] | null;
  fitzpatrickTone?: number;
}

export function SafetyScreeningCard({ safetyResults, fitzpatrickTone = 3 }: SafetyScreeningCardProps) {
  const flags = safetyResults || [];
  const hasUrgent = flags.some((f) => f.requiresPhysicianReferral);

  return (
    <View style={styles.cardContainer}>
      <View style={styles.headerRow}>
        <View style={styles.titleBadge}>
          {hasUrgent ? (
            <AlertOctagon size={18} color="#EF4444" />
          ) : (
            <CheckCircle2 size={18} color="#10B981" />
          )}
          <Text style={styles.cardTitle}>Lesion Safety Screening (ABCDE)</Text>
        </View>
        <View
          style={[
            styles.statusPill,
            {
              backgroundColor: hasUrgent ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)",
              borderColor: hasUrgent ? "rgba(239, 68, 68, 0.3)" : "rgba(16, 185, 129, 0.3)",
            },
          ]}
        >
          <Text
            style={[
              styles.statusPillText,
              { color: hasUrgent ? "#F87171" : "#34D399" },
            ]}
          >
            {hasUrgent ? "ACTION REQUIRED" : "SAFE SCREENING"}
          </Text>
        </View>
      </View>

      {flags.length === 0 ? (
        <View style={styles.cleanRow}>
          <Text style={styles.cleanText}>
            No atypical asymmetric borders, pigment variegation, or lesion expansion detected.
          </Text>
          {fitzpatrickTone >= 5 && (
            <View style={styles.dpnBadge}>
              <UserCheck size={13} color="#A78BFA" />
              <Text style={styles.dpnText}>
                Melanated Skin Safeguards Active: Benign DPN excluded from malignant melanoma flagging.
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.flagsList}>
          {flags.map((item, idx) => {
            const isCritical = item.requiresPhysicianReferral;
            return (
              <View
                key={idx}
                style={[
                  styles.flagItem,
                  {
                    borderColor: isCritical ? "rgba(239, 68, 68, 0.3)" : "rgba(245, 158, 11, 0.3)",
                    backgroundColor: isCritical ? "rgba(239, 68, 68, 0.08)" : "rgba(245, 158, 11, 0.08)",
                  },
                ]}
              >
                <View style={styles.flagHeader}>
                  <View style={styles.flagTitleRow}>
                    <AlertTriangle size={15} color={isCritical ? "#F87171" : "#FBBF24"} />
                    <Text style={styles.flagZone}>
                      {(item.zone || "facial").replace("_", " ").toUpperCase()} LESION
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.flagLevel,
                      { color: isCritical ? "#F87171" : "#FBBF24" },
                    ]}
                  >
                    {item.level}
                  </Text>
                </View>

                <Text style={styles.flagMessage}>{item.clinicalMessage}</Text>

                {item.abcde && (
                  <View style={styles.abcdeGrid}>
                    <Text style={styles.abcdeItem}>
                      Diam: {item.abcde.diameterMm}mm
                    </Text>
                    <Text style={styles.abcdeItem}>
                      Asymmetry: {Math.round(item.abcde.asymmetry * 100)}%
                    </Text>
                    <Text style={styles.abcdeItem}>
                      Evo: {item.abcde.evolutionDetected ? "Detected" : "None"}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#131B2E",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1E293B",
    marginTop: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  titleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F8FAFC",
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  cleanRow: {
    backgroundColor: "#0B111E",
    borderRadius: 10,
    padding: 12,
  },
  cleanText: {
    fontSize: 12,
    color: "#94A3B8",
    lineHeight: 17,
  },
  dpnBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
  },
  dpnText: {
    fontSize: 11,
    color: "#C4B5FD",
    flex: 1,
    lineHeight: 15,
  },
  flagsList: {
    gap: 8,
  },
  flagItem: {
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
  },
  flagHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  flagTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  flagZone: {
    fontSize: 11,
    fontWeight: "800",
    color: "#F8FAFC",
  },
  flagLevel: {
    fontSize: 10,
    fontWeight: "800",
  },
  flagMessage: {
    fontSize: 12,
    color: "#E2E8F0",
    lineHeight: 17,
    marginBottom: 8,
  },
  abcdeGrid: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
  },
  abcdeItem: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "600",
  },
});
