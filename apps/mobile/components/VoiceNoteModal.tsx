import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  Mic,
  MicOff,
  X,
  Sparkles,
  Layers,
  AlertCircle,
  Clock,
  Flame,
} from "lucide-react-native";

interface VoiceNoteModalProps {
  visible: boolean;
  onClose: () => void;
  onSignalsExtracted?: (signals: any) => void;
}

export function VoiceNoteModal({
  visible,
  onClose,
  onSignalsExtracted,
}: VoiceNoteModalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [extracted, setExtracted] = useState<any | null>(null);

  const startRecording = () => {
    setIsRecording(true);
    setTranscript(null);
    setExtracted(null);

    // Simulate 3 seconds speech capture
    setTimeout(() => {
      setIsRecording(false);
      const simulatedText =
        "I started using a new niacinamide serum last week, and my forehead oiliness improved, but yesterday I noticed some burning redness and small breakouts around my chin after eating dairy.";
      setTranscript(simulatedText);
      runNlpExtraction(simulatedText);
    }, 3000);
  };

  const runNlpExtraction = (text: string) => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      const signals = {
        productChanges: [{ product: "niacinamide serum", action: "started", timeframe: "last week" }],
        concerns: [
          { description: "oiliness", zone: "forehead", severity: "mild" },
          { description: "breakout", zone: "chin", severity: "moderate" },
        ],
        triggers: [{ trigger: "dairy", correlation: "Reported dietary trigger" }],
        sensations: [{ feeling: "burning", zone: "chin" }],
        timeline: [{ event: "Shift noticed", when: "yesterday" }],
      };
      setExtracted(signals);
      if (onSignalsExtracted) onSignalsExtracted(signals);
    }, 1000);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Mic size={16} color="#111827" />
              </View>
              <View>
                <Text style={styles.headerTitle}>VOICE CLINICAL CHECK-IN</Text>
                <Text style={styles.headerSub}>Speech-to-Signal NLP Extraction</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
              <X size={18} color="#111827" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Record Area */}
            <View style={styles.recordBox}>
              <TouchableOpacity
                style={[styles.micBtn, isRecording && styles.micBtnActive]}
                onPress={startRecording}
                disabled={isRecording || analyzing}
              >
                {isRecording ? (
                  <MicOff size={24} color="#FFFFFF" />
                ) : (
                  <Mic size={24} color="#FFFFFF" />
                )}
              </TouchableOpacity>
              <Text style={styles.recordHint}>
                {isRecording
                  ? "Listening... Speak naturally about recent skin changes or reactions"
                  : analyzing
                    ? "Extracting clinical entities with NLP..."
                    : "Tap to record your symptom check-in (30s limit)"}
              </Text>
            </View>

            {/* Transcript Area */}
            {transcript && (
              <View style={styles.transcriptCard}>
                <Text style={styles.transcriptLabel}>SPOKEN TRANSCRIPT</Text>
                <Text style={styles.transcriptText}>"{transcript}"</Text>
              </View>
            )}

            {/* Extracted NLP Entities */}
            {analyzing && (
              <View style={styles.loadingWrap}>
                <ActivityIndicator size="small" color="#111827" />
                <Text style={styles.loadingText}>Analyzing linguistic patterns...</Text>
              </View>
            )}

            {extracted && (
              <View style={styles.signalsContainer}>
                <Text style={styles.signalsTitle}>EXTRACTED CLINICAL ENTITIES</Text>

                {/* Product change */}
                {extracted.productChanges.map((p: any, i: number) => (
                  <View key={i} style={styles.signalCard}>
                    <Layers size={14} color="#111827" />
                    <View style={styles.signalInfo}>
                      <Text style={styles.signalLabel}>PRODUCT EVENT</Text>
                      <Text style={styles.signalValue}>
                        {p.action.toUpperCase()}: {p.product} ({p.timeframe})
                      </Text>
                    </View>
                  </View>
                ))}

                {/* Concerns */}
                {extracted.concerns.map((c: any, i: number) => (
                  <View key={i} style={styles.signalCard}>
                    <AlertCircle size={14} color="#111827" />
                    <View style={styles.signalInfo}>
                      <Text style={styles.signalLabel}>REPORTED CONCERN</Text>
                      <Text style={styles.signalValue}>
                        {c.description} on {c.zone} ({c.severity})
                      </Text>
                    </View>
                  </View>
                ))}

                {/* Sensations */}
                {extracted.sensations.map((s: any, i: number) => (
                  <View key={i} style={styles.signalCard}>
                    <Flame size={14} color="#111827" />
                    <View style={styles.signalInfo}>
                      <Text style={styles.signalLabel}>SENSATION</Text>
                      <Text style={styles.signalValue}>
                        {s.feeling} sensation around {s.zone}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => {
                if (extracted) {
                  Alert.alert("Signals Saved", "Extracted signals attached to today's longitudinal history.");
                }
                onClose();
              }}
            >
              <Text style={styles.doneBtnText}>
                {extracted ? "ATTACH SIGNALS TO HISTORY" : "CLOSE"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.4)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "85%",
    paddingTop: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 6,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  headerSub: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 2,
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: "#F3F4F6",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  recordBox: {
    alignItems: "center",
    marginVertical: 14,
  },
  micBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  micBtnActive: {
    backgroundColor: "#DC2626",
  },
  recordHint: {
    fontSize: 11,
    color: "#6B7280",
    textAlign: "center",
    maxWidth: 240,
    lineHeight: 16,
  },
  transcriptCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  transcriptLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#6B7280",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  transcriptText: {
    fontSize: 12,
    color: "#111827",
    lineHeight: 18,
    fontStyle: "italic",
  },
  loadingWrap: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  loadingText: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
  },
  signalsContainer: {
    marginBottom: 20,
  },
  signalsTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  signalCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  signalInfo: {
    flex: 1,
  },
  signalLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: "#6B7280",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  signalValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  doneBtn: {
    backgroundColor: "#111827",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  doneBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
});
