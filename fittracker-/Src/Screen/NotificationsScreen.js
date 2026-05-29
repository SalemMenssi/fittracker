import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Switch, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getNotificationSettings, saveNotificationSettings } from "../services/SettingsService";
import { useIsFocused } from "@react-navigation/native";

export default function NotificationsScreen({ navigation }) {
  const isFocused = useIsFocused();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const s = await getNotificationSettings();
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
    await saveNotificationSettings(newSettings); // update store asynchronously
  };

  const items = [
    { key: "workoutReminders", label: "Workout Reminders", sub: "Daily reminders to stay on track" },
    { key: "weeklyReport", label: "Weekly Report", sub: "Summary of your weekly performance" },
    { key: "achievements", label: "Achievements", sub: "When you earn a new badge" },
    { key: "newCourses", label: "New Courses", sub: "Latest courses added for you" },
    { key: "socialActivity", label: "Social Activity", sub: "Likes and comments on your posts" },
  ];

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
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 26 }} />
      </View>

      <View style={styles.card}>
        {items.map((item, i) => (
          <View key={item.key} style={[styles.row, i === items.length - 1 && { borderBottomWidth: 0 }]}>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>{item.label}</Text>
              <Text style={styles.rowSub}>{item.sub}</Text>
            </View>
            <Switch
              value={settings[item.key]}
              onValueChange={() => toggle(item.key)}
              trackColor={{ false: "#e0e0e0", true: "#00c2c2" }}
              thumbColor="#fff"
            />
          </View>
        ))}
      </View>
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
  card: {
    backgroundColor: "#fff", marginHorizontal: 20, marginTop: 20,
    borderRadius: 20, padding: 4, elevation: 2,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8,
  },
  row: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#f5f5f5",
  },
  rowText: { flex: 1, marginRight: 12 },
  rowLabel: { fontSize: 15, fontWeight: "600", color: "#111" },
  rowSub: { fontSize: 12, color: "#aaa", marginTop: 2 },
});