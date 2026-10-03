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
                <Mic size={20} color="#8B5CF6" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Voice Clinical Note</Text>
                <Text style={styles.headerSub}>AI Speech-to-Signal Extraction</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
              <X size={20} color="#94A3B8" />
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
                  <MicOff size={32} color="#FFFFFF" />
                ) : (
                  <Mic size={32} color="#FFFFFF" />
                )}
              </TouchableOpacity>
              <Text style={styles.recordHint}>
                {isRecording
                  ? "Listening... Speak naturally about your skin changes"
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
                <ActivityIndicator size="small" color="#8B5CF6" />
                <Text style={styles.loadingText}>Analyzing linguistic patterns...</Text>
              </View>
            )}

            {extracted && (
              <View style={styles.signalsContainer}>
                <Text style={styles.signalsTitle}>EXTRACTED CLINICAL ENTITIES</Text>

                {/* Product change */}
                {extracted.productChanges.map((p: any, i: number) => (
                  <View key={i} style={styles.signalCard}>
                    <Layers size={16} color="#38BDF8" />
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
                    <AlertCircle size={16} color="#F59E0B" />
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
                    <Flame size={16} color="#EF4444" />
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
                {extracted ? "Attach Signals to History" : "Close"}
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
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#0F172A",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    paddingTop: 20,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#8B5CF620",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#F8FAFC",
  },
  headerSub: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#1E293B",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  recordBox: {
    alignItems: "center",
    marginBottom: 20,
  },
  micBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#8B5CF6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    elevation: 4,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  micBtnActive: {
    backgroundColor: "#EF4444",
  },
  recordHint: {
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "center",
    maxWidth: 240,
  },
  transcriptCard: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  transcriptLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  transcriptText: {
    fontSize: 13,
    color: "#E2E8F0",
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
    fontSize: 12,
    color: "#A78BFA",
  },
  signalsContainer: {
    marginBottom: 24,
  },
  signalsTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  signalCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#0F172A",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#33415550",
  },
  signalInfo: {
    flex: 1,
  },
  signalLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#64748B",
  },
  signalValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#F8FAFC",
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#1E293B",
    backgroundColor: "#0F172A",
  },
  doneBtn: {
    backgroundColor: "#8B5CF6",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  doneBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
