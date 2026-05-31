import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TextInput, FlatList, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getAllUsersForAdmin } from "../../services/AdminService";

export default function AdminUsersScreen() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    getAllUsersForAdmin().then(setUsers).catch(() => setUsers([]));
  }, []);

  const filtered = users.filter((u) => (u.fullName || "").toLowerCase().includes(query.toLowerCase()));
  const maxPoints = Math.max(1, ...users.map((u) => u.points || 0));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <View>
          <Text style={styles.title}>Hunter Registry</Text>
          <Text style={styles.subtitle}>Manage users and power rankings</Text>
        </View>
        <Ionicons name="shield-outline" size={28} color="#00c2c2" />
      </View>
      <View style={styles.metricRow}>
        <View style={styles.metricCard}><Ionicons name="people-outline" size={16} color="#00c2c2" /><Text style={styles.metricValue}>{users.length}</Text><Text style={styles.metricLabel}>Hunters</Text></View>
        <View style={styles.metricCard}><Ionicons name="flash-outline" size={16} color="#ff8c42" /><Text style={styles.metricValue}>{maxPoints}</Text><Text style={styles.metricLabel}>Top Power</Text></View>
      </View>
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color="#999" />
        <TextInput
          style={styles.search}
          value={query}
          onChangeText={setQuery}
          placeholder="Search users..."
          placeholderTextColor="#999"
        />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item, idx) => item._id || String(idx)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.avatar || "https://randomuser.me/api/portraits/men/1.jpg" }} style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{item.fullName}</Text>
                <Ionicons name="sparkles-outline" size={14} color="#00c2c2" />
              </View>
              <Text style={styles.meta}>Power: {item.points || 0}</Text>
              <View style={styles.barBg}>
                <View style={[styles.barFill, { width: `${Math.min(100, ((item.points || 0) / maxPoints) * 100)}%` }]} />
              </View>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6f8", padding: 20 },
  hero: { backgroundColor: "#111", borderRadius: 16, padding: 14, marginBottom: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  subtitle: { marginTop: 4, color: "#bbb", fontSize: 12 },
  metricRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  metricCard: { flex: 1, backgroundColor: "#fff", borderRadius: 12, padding: 10, alignItems: "flex-start" },
  metricValue: { marginTop: 4, fontSize: 18, color: "#111", fontWeight: "800" },
  metricLabel: { marginTop: 2, color: "#888", fontSize: 11 },
  searchWrap: { backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#e5e5e5", paddingHorizontal: 10, marginBottom: 10, flexDirection: "row", alignItems: "center" },
  search: { flex: 1, padding: 12 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 12, marginBottom: 10, flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#eee" },
  nameRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  name: { fontSize: 15, fontWeight: "700", color: "#111" },
  meta: { fontSize: 12, color: "#666", marginTop: 2 },
  barBg: { marginTop: 6, height: 6, borderRadius: 3, backgroundColor: "#edf0f2" },
  barFill: { height: 6, borderRadius: 3, backgroundColor: "#00c2c2" },
});
