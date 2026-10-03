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
                <Users size={20} color="#0284C7" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Family Profiles</Text>
                <Text style={styles.headerSub}>Isolated Scans & Routines</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
              <X size={20} color="#94A3B8" />
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
                      <User size={18} color={isActive ? "#0284C7" : "#94A3B8"} />
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
                            <Lock size={10} color="#38BDF8" />
                            <Text style={styles.lockBadgeText}>FACE ID LOCK</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    {isActive ? (
                      <View style={styles.checkCircle}>
                        <Check size={14} color="#FFFFFF" />
                      </View>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Add Profile Section */}
            {showAddForm ? (
              <View style={styles.addForm}>
                <Text style={styles.formTitle}>Add New Family Member</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Leo (Teens) or Mom"
                  placeholderTextColor="#64748B"
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
                    trackColor={{ false: "#334155", true: "#0284C7" }}
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
                <Plus size={18} color="#0284C7" />
                <Text style={styles.addProfileText}>Add Profile</Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
              <Text style={styles.doneBtnText}>Close</Text>
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
    backgroundColor: "#0284C720",
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
    paddingTop: 16,
  },
  list: {
    marginBottom: 16,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#334155",
  },
  profileCardActive: {
    borderColor: "#0284C7",
    backgroundColor: "#0284C710",
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F8FAFC",
  },
  badgesRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 4,
  },
  defaultBadge: {
    backgroundColor: "#334155",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#94A3B8",
  },
  lockBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#0284C720",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lockBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#38BDF8",
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#0284C7",
    alignItems: "center",
    justifyContent: "center",
  },
  addProfileBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#1E293B",
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#0284C750",
    borderStyle: "dashed",
    marginBottom: 20,
  },
  addProfileText: {
    color: "#38BDF8",
    fontSize: 14,
    fontWeight: "600",
  },
  addForm: {
    backgroundColor: "#1E293B",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#334155",
  },
  formTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#F8FAFC",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#0F172A",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#F8FAFC",
    fontSize: 13,
    borderWidth: 1,
    borderColor: "#334155",
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
    fontSize: 12,
    fontWeight: "600",
    color: "#F8FAFC",
  },
  lockToggleSub: {
    fontSize: 11,
    color: "#64748B",
  },
  formActions: {
    flexDirection: "row",
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#0F172A",
    borderRadius: 8,
  },
  cancelBtnText: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "600",
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#0284C7",
    borderRadius: 8,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#1E293B",
    backgroundColor: "#0F172A",
  },
  doneBtn: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  doneBtnText: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "600",
  },
});
