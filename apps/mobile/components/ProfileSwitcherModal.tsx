import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Alert,
} from "react-native";
import {
  Users,
  X,
  Plus,
  Check,
  Lock,
  User,
  ShieldAlert,
} from "lucide-react-native";

interface ProfileItem {
  id: string;
  displayName: string;
  isDefault: boolean;
  biometricLockEnabled: boolean;
}

interface ProfileSwitcherModalProps {
  visible: boolean;
  onClose: () => void;
  activeProfileId?: string;
  onSelectProfile?: (profileId: string) => void;
}

export function ProfileSwitcherModal({
  visible,
  onClose,
  activeProfileId = "prof-default",
  onSelectProfile,
}: ProfileSwitcherModalProps) {
  const [profiles, setProfiles] = useState<ProfileItem[]>([
    {
      id: "prof-default",
      displayName: "Primary Profile (You)",
      isDefault: true,
      biometricLockEnabled: false,
    },
    {
      id: "prof-teen",
      displayName: "Emma (Teens)",
      isDefault: false,
      biometricLockEnabled: true,
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [newProfileLock, setNewProfileLock] = useState(false);

  const handleAddProfile = () => {
    if (!newProfileName.trim()) {
      Alert.alert("Name Required", "Please enter a profile name");
      return;
    }

    const newProf: ProfileItem = {
      id: `prof-${Date.now()}`,
      displayName: newProfileName.trim(),
      isDefault: false,
      biometricLockEnabled: newProfileLock,
    };

    setProfiles((prev) => [...prev, newProf]);
    setNewProfileName("");
    setNewProfileLock(false);
    setShowAddForm(false);
    Alert.alert("Profile Added", `Data for ${newProf.displayName} will be strictly isolated.`);
  };

  const handleSwitch = (id: string, locked: boolean) => {
    if (locked) {
      Alert.alert("Face ID Verification", "Biometric authentication required to unlock this profile.", [
        {
          text: "Authenticate",
          onPress: () => {
            if (onSelectProfile) onSelectProfile(id);
            onClose();
          },
        },
        { text: "Cancel", style: "cancel" },
      ]);
    } else {
      if (onSelectProfile) onSelectProfile(id);
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Users size={16} color="#111827" />
              </View>
              <View>
                <Text style={styles.headerTitle}>FAMILY PROFILES</Text>
                <Text style={styles.headerSub}>Isolated Scans & Clinical Data</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
              <X size={18} color="#111827" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Profiles List */}
            <View style={styles.list}>
              {profiles.map((p) => {
                const isActive = p.id === activeProfileId;
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.profileCard, isActive && styles.profileCardActive]}
                    onPress={() => handleSwitch(p.id, p.biometricLockEnabled)}
                  >
                    <View style={styles.avatarCircle}>
                      <User size={16} color="#111827" />
                    </View>
                    <View style={styles.profileInfo}>
                      <Text style={styles.profileName}>{p.displayName}</Text>
                      <View style={styles.badgesRow}>
                        {p.isDefault && (
                          <View style={styles.defaultBadge}>
                            <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                          </View>
                        )}
                        {p.biometricLockEnabled && (
                          <View style={styles.lockBadge}>
                            <Lock size={9} color="#111827" />
                            <Text style={styles.lockBadgeText}>FACE ID LOCK</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    {isActive ? (
                      <View style={styles.checkCircle}>
                        <Check size={12} color="#FFFFFF" strokeWidth={3} />
                      </View>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Add Profile Section */}
            {showAddForm ? (
              <View style={styles.addForm}>
                <Text style={styles.formTitle}>ADD NEW FAMILY PROFILE</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Leo (Teens) or Mom"
                  placeholderTextColor="#9CA3AF"
                  value={newProfileName}
                  onChangeText={setNewProfileName}
                />
                <View style={styles.lockToggleRow}>
                  <View style={styles.lockToggleLeft}>
                    <Text style={styles.lockToggleTitle}>Require Biometric Lock</Text>
                    <Text style={styles.lockToggleSub}>Private health data protection</Text>
                  </View>
                  <Switch
                    value={newProfileLock}
                    onValueChange={setNewProfileLock}
                    trackColor={{ false: "#E5E7EB", true: "#111827" }}
                    thumbColor="#FFFFFF"
                  />
                </View>
                <View style={styles.formActions}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setShowAddForm(false)}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={handleAddProfile}
                  >
                    <Text style={styles.saveBtnText}>Save Profile</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addProfileBtn}
                onPress={() => setShowAddForm(true)}
              >
                <Plus size={14} color="#111827" />
                <Text style={styles.addProfileText}>Add Family Profile</Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
              <Text style={styles.doneBtnText}>CLOSE</Text>
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
  list: {
    marginBottom: 14,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  profileCardActive: {
    borderColor: "#111827",
    backgroundColor: "#F9FAFB",
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
  badgesRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 3,
  },
  defaultBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  defaultBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#6B7280",
    letterSpacing: 0.5,
  },
  lockBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  lockBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: 0.5,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  addProfileBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderStyle: "dashed",
    marginBottom: 20,
  },
  addProfileText: {
    color: "#111827",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  addForm: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  formTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#111827",
    fontSize: 13,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  lockToggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  lockToggleLeft: {
    flex: 1,
  },
  lockToggleTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#111827",
  },
  lockToggleSub: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 1,
  },
  formActions: {
    flexDirection: "row",
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
  },
  cancelBtnText: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 6,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
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
