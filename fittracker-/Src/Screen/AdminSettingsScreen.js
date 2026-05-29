import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, Switch, Alert, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getProfile, logout, updateUser } from "../services/AuthService";

export default function AdminSettingsScreen({ navigation }) {
  const [settings, setSettings] = useState({
    achievements: true,
    weeklyReport: true,
    socialActivity: false,
  });

  useEffect(() => {
    getProfile().then((u) => {
      const ns = u?.notificationSettings || {};
      setSettings({
        achievements: ns.achievements ?? true,
        weeklyReport: ns.weeklyReport ?? true,
        socialActivity: ns.socialActivity ?? false,
      });
    });
  }, []);

  const toggle = async (key) => {
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    try {
      await updateUser({ notificationSettings: next });
    } catch {
      Alert.alert("Error", "Failed to save admin settings.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <View>
          <Text style={styles.title}>System Core</Text>
          <Text style={styles.subtitle}>Admin control and combat toggles</Text>
        </View>
        <Ionicons name="settings-outline" size={28} color="#00c2c2" />
      </View>
      <View style={styles.powerCard}>
        <Text style={styles.powerTitle}>Power Grid</Text>
        <View style={styles.powerBars}>
          {[88, 74, 92, 65, 81].map((v, i) => <View key={i} style={[styles.powerBar, { height: v / 2 }]} />)}
        </View>
      </View>
      {Object.keys(settings).map((k) => (
        <View key={k} style={styles.row}>
          <View style={styles.labelWrap}>
            <Ionicons name="flash-outline" size={14} color="#00c2c2" />
            <Text style={styles.label}>{k}</Text>
          </View>
          <Switch value={settings[k]} onValueChange={() => toggle(k)} trackColor={{ false: "#ddd", true: "#00c2c2" }} />
        </View>
      ))}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={async () => {
          await logout();
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        }}
      >
        <Ionicons name="log-out-outline" size={16} color="#fff" />
        <Text style={styles.logoutText}>Logout Admin</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6f8", padding: 20 },
  hero: { backgroundColor: "#111", borderRadius: 16, padding: 14, marginBottom: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  subtitle: { marginTop: 4, color: "#bbb", fontSize: 12 },
  powerCard: { backgroundColor: "#fff", borderRadius: 12, padding: 12, marginBottom: 10 },
  powerTitle: { color: "#111", fontWeight: "700", fontSize: 13 },
  powerBars: { marginTop: 8, height: 48, flexDirection: "row", alignItems: "flex-end", gap: 8 },
  powerBar: { width: 8, borderRadius: 4, backgroundColor: "#00c2c2" },
  row: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  labelWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  label: { color: "#111", fontWeight: "600", textTransform: "capitalize" },
  logoutBtn: { marginTop: 10, backgroundColor: "#111", borderRadius: 12, paddingVertical: 12, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  logoutText: { color: "#fff", fontWeight: "700" },
});
