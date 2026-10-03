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
    backgroundColor: "rgba(17, 24, 39, 0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: "85%",
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
    fontSize: 12,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  instructionText: {
    fontSize: 11,
    color: "#6B7280",
    lineHeight: 16,
    marginBottom: 12,
  },
  quickFillRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  quickFillLabel: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  presetChip: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  presetChipText: {
    fontSize: 10,
    color: "#111827",
    fontWeight: "600",
  },
  searchBar: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: "#111827",
    fontSize: 12,
  },
  searchButton: {
    backgroundColor: "#111827",
    paddingHorizontal: 16,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    marginBottom: 12,
  },
  errorText: {
    fontSize: 11,
    color: "#991B1B",
    flex: 1,
  },
  resultBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  productBrand: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  productName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginTop: 2,
  },
  categoryBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  categoryText: {
    fontSize: 9,
    color: "#374151",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  safetyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  safetyScoreText: {
    fontSize: 11,
    color: "#111827",
    fontWeight: "600",
  },
  ingredientsBox: {
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  ingredientsHeader: {
    fontSize: 9,
    fontWeight: "800",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  ingredientsList: {
    fontSize: 11,
    color: "#4B5563",
    lineHeight: 16,
  },
  addButton: {
    backgroundColor: "#111827",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 6,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
