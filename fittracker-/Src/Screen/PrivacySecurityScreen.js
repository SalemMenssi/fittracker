import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Switch, ActivityIndicator, Modal, TextInput, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getPrivacySettings, savePrivacySettings } from "../services/SettingsService";
import { updateUser } from "../services/AuthService";
import { useIsFocused } from "@react-navigation/native";

export default function PrivacySecurityScreen({ navigation }) {
  const isFocused = useIsFocused();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const s = await getPrivacySettings();
        setSettings(s);
      } finally {
        setLoading(false);
      }
    };
    if (isFocused) loadSettings();
  }, [isFocused]);

  const toggle = async (key) => {
    if (!settings) return;
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    await savePrivacySettings(newSettings);
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long.");
      return;
    }
    try {
      setChanging(true);
      await updateUser({ password: newPassword });
      setShowPasswordModal(false);
      setNewPassword("");
      Alert.alert("Success", "Password updated successfully!");
    } catch (e) {
      Alert.alert("Error", "Failed to update password.");
    } finally {
      setChanging(false);
    }
  };

  if (loading || !settings) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#00c2c2" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back-outline" size={26} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Security */}
      <Text style={styles.sectionLabel}>SECURITY</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#00c2c2" />
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Two-Factor Authentication</Text>
              <Text style={styles.rowSub}>Add an extra layer of security</Text>
            </View>
          </View>
          <Switch
            value={settings.twoFactor}
            onValueChange={() => toggle('twoFactor')}
            trackColor={{ false: "#e0e0e0", true: "#00c2c2" }}
            thumbColor="#fff"
          />
        </View>

        <TouchableOpacity 
          style={[styles.row, { borderBottomWidth: 0 }]}
          onPress={() => setShowPasswordModal(true)}
        >
          <View style={styles.rowLeft}>
            <Ionicons name="key-outline" size={20} color="#00c2c2" />
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Change Password</Text>
              <Text style={styles.rowSub}>Update your password regularly</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward-outline" size={18} color="#ccc" />
        </TouchableOpacity>
      </View>

      {/* Privacy */}
      <Text style={styles.sectionLabel}>PRIVACY</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name="eye-outline" size={20} color="#00c2c2" />
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Public Profile</Text>
              <Text style={styles.rowSub}>Let others see your profile</Text>
            </View>
          </View>
          <Switch
            value={settings.publicProfile}
            onValueChange={() => toggle('publicProfile')}
            trackColor={{ false: "#e0e0e0", true: "#00c2c2" }}
            thumbColor="#fff"
          />
        </View>

        <View style={[styles.row, { borderBottomWidth: 0 }]}>
          <View style={styles.rowLeft}>
            <Ionicons name="analytics-outline" size={20} color="#00c2c2" />
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Data Sharing</Text>
              <Text style={styles.rowSub}>Share usage data to improve the app</Text>
            </View>
          </View>
          <Switch
            value={settings.dataSharing}
            onValueChange={() => toggle('dataSharing')}
            trackColor={{ false: "#e0e0e0", true: "#00c2c2" }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Password Modal */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <Text style={styles.modalSub}>Enter your new password below.</Text>
            
            <TextInput
              style={styles.passwordInput}
              placeholder="New Password"
              placeholderTextColor="#aaa"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.cancelBtn]} 
                onPress={() => setShowPasswordModal(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.confirmBtn]} 
                onPress={handleChangePassword}
                disabled={changing}
              >
                {changing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.confirmBtnText}>Update</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6f8" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 14, backgroundColor: "#fff",
  },
  headerTitle: { fontSize: 17, fontWeight: "bold", color: "#111" },
  sectionLabel: {
    fontSize: 11, color: "#aaa", fontWeight: "600", letterSpacing: 1,
    paddingHorizontal: 28, marginTop: 20, marginBottom: 8,
  },
  card: {
    backgroundColor: "#fff", marginHorizontal: 20, borderRadius: 20,
    padding: 4, elevation: 2,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8,
  },
  row: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#f5f5f5",
  },
  rowLeft: { flexDirection: "row", alignItems: "center", flex: 1, gap: 12 },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: "600", color: "#111" },
  rowSub: { fontSize: 12, color: "#aaa", marginTop: 2 },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 8,
    textAlign: "center",
  },
  modalSub: {
    fontSize: 14,
    color: "#888",
    marginBottom: 20,
    textAlign: "center",
  },
  passwordInput: {
    backgroundColor: "#f5f6f8",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: "#111",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#eee",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtn: {
    backgroundColor: "#f5f6f8",
  },
  cancelBtnText: {
    color: "#888",
    fontWeight: "600",
  },
  confirmBtn: {
    backgroundColor: "#00c2c2",
  },
  confirmBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },
});