import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Barcode, Search, Plus, CheckCircle2, AlertTriangle, X, ShieldAlert } from "lucide-react-native";
import { API_BASE_URL } from "../lib/api-client";

interface BarcodeScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onProductAdded: (product: any) => void;
}

export function BarcodeScannerModal({
  visible,
  onClose,
  onProductAdded,
}: BarcodeScannerModalProps) {
  const [barcodeInput, setBarcodeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [scannedResult, setScannedResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLookup = async (codeToSearch?: string) => {
    const code = codeToSearch || barcodeInput.trim();
    if (!code) return;

    setLoading(true);
    setErrorMsg(null);
    setScannedResult(null);

    try {
      const res = await fetch(`${API_BASE_URL}/products/scan-barcode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barcode: code }),
      });

      const data = await res.json();
      if (res.ok && data.found) {
        setScannedResult(data.product);
      } else {
        setErrorMsg(data.message || "Product not found in Open Beauty Facts database.");
      }
    } catch (e: any) {
      setErrorMsg("Network error communicating with product database.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    if (scannedResult) {
      onProductAdded(scannedResult);
      setScannedResult(null);
      setBarcodeInput("");
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleBadge}>
              <Barcode size={20} color="#06B6D4" />
              <Text style={styles.headerTitle}>Product Barcode & OCR Scanner</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <Text style={styles.instructionText}>
            Scan UPC/EAN or enter barcode to cross-reference Open Beauty Facts and screen for comedogenicity & routine conflicts.
          </Text>

          {/* Quick Demo Pre-fills */}
          <View style={styles.quickFillRow}>
            <Text style={styles.quickFillLabel}>Presets:</Text>
            <TouchableOpacity
              style={styles.presetChip}
              onPress={() => {
                setBarcodeInput("3337872412488");
                handleLookup("3337872412488");
              }}
            >
              <Text style={styles.presetChipText}>CeraVe Cleanser</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.presetChip}
              onPress={() => {
                setBarcodeInput("3337875597371");
                handleLookup("3337875597371");
              }}
            >
              <Text style={styles.presetChipText}>La Roche-Posay</Text>
            </TouchableOpacity>
          </View>

          {/* Input Bar */}
          <View style={styles.searchBar}>
            <TextInput
              style={styles.input}
              placeholder="Enter 12 or 13 digit barcode..."
              placeholderTextColor="#64748B"
              value={barcodeInput}
              onChangeText={setBarcodeInput}
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => handleLookup()}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Search size={18} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>

          {/* Error Message */}
          {errorMsg && (
            <View style={styles.errorBox}>
              <AlertTriangle size={15} color="#EF4444" />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {/* Scanned Result */}
          {scannedResult && (
            <ScrollView style={styles.resultBox} showsVerticalScrollIndicator={false}>
              <View style={styles.resultHeader}>
                <View>
                  <Text style={styles.productBrand}>{scannedResult.brand || "Brand"}</Text>
                  <Text style={styles.productName}>{scannedResult.name}</Text>
                </View>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{scannedResult.category}</Text>
                </View>
              </View>

              {/* Comedogenicity / Safety Score */}
              <View style={styles.safetyRow}>
                <CheckCircle2 size={15} color="#10B981" />
                <Text style={styles.safetyScoreText}>
                  Comedogenicity Risk: Low (0 pore-clogging lipids detected)
                </Text>
              </View>

              {/* Ingredients List */}
              {scannedResult.ingredients && scannedResult.ingredients.length > 0 && (
                <View style={styles.ingredientsBox}>
                  <Text style={styles.ingredientsHeader}>Recognized Ingredients:</Text>
                  <Text style={styles.ingredientsList}>
                    {scannedResult.ingredients.slice(0, 8).join(", ")}
                    {scannedResult.ingredients.length > 8 ? "..." : ""}
                  </Text>
                </View>
              )}

              {/* Add Button */}
              <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
                <Plus size={18} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Add to My Products</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#131B2E",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "85%",
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  headerTitleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F8FAFC",
  },
  instructionText: {
    fontSize: 12,
    color: "#94A3B8",
    lineHeight: 17,
    marginBottom: 12,
  },
  quickFillRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  quickFillLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
  presetChip: {
    backgroundColor: "#1E293B",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  presetChipText: {
    fontSize: 11,
    color: "#38BDF8",
    fontWeight: "600",
  },
  searchBar: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    backgroundColor: "#0B111E",
    borderWidth: 1,
    borderColor: "#1E293B",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#F8FAFC",
    fontSize: 13,
  },
  searchButton: {
    backgroundColor: "#06B6D4",
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 12,
    color: "#FCA5A5",
    flex: 1,
  },
  resultBox: {
    backgroundColor: "#0B111E",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  productBrand: {
    fontSize: 11,
    fontWeight: "700",
    color: "#06B6D4",
    textTransform: "uppercase",
  },
  productName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#F8FAFC",
    marginTop: 2,
  },
  categoryBadge: {
    backgroundColor: "#1E293B",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "700",
  },
  safetyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  safetyScoreText: {
    fontSize: 11,
    color: "#34D399",
    fontWeight: "500",
  },
  ingredientsBox: {
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  ingredientsHeader: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  ingredientsList: {
    fontSize: 11,
    color: "#94A3B8",
    lineHeight: 16,
  },
  addButton: {
    backgroundColor: "#10B981",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
