import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Image, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getLeaderboard } from "../../services/LeaderboardService";
import { getCurrentUser } from "../../services/AuthService";
import { useIsFocused } from "@react-navigation/native";

export default function LeaderBoardScreen({ navigation }) {
  const isFocused = useIsFocused();
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [lb, user] = await Promise.all([getLeaderboard(), getCurrentUser()]);
        setLeaderboard(lb);
        setCurrentUser(user);
      } finally {
        setLoading(false);
      }
    };
    if (isFocused) load();
  }, [isFocused]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#00c2c2" />
      </SafeAreaView>
    );
  }

  const podium = leaderboard.slice(0, 3);               // rank 1, 2, 3
  const rest   = leaderboard.slice(3);                  // rank 4+
  const myRank = leaderboard.find((u) => u.id === currentUser?.id);

  // podium ordered: 2nd | 1st | 3rd
  const podiumOrdered = [podium[1], podium[0], podium[2]].filter(Boolean);
  const podiumColors  = { 0: "#C0C0C0", 1: "#FFD700", 2: "#CD7F32" }; // silver, gold, bronze

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back-outline" size={26} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Podium */}
        <View style={styles.podiumSection}>
          <Text style={styles.podiumTitle}>🏆 Top 3 This Week</Text>
          <View style={styles.podium}>
            {podiumOrdered.map((item, idx) => {
              const isFirst = item?.rank === 1;
              const color = item ? podiumColors[item.rank - 1] : "#ccc";
              const blockHeights = [60, 90, 40];
              return (
                <View key={item?.id || idx} style={[styles.podiumItem, isFirst && { marginBottom: 0 }]}>
                  {isFirst && <Ionicons name="crown" size={24} color="#FFD700" style={{ marginBottom: 4 }} />}
                  <Image
                    source={{ uri: item?.avatar }}
                    style={[styles.podiumAvatar, { borderColor: color, width: isFirst ? 75 : 60, height: isFirst ? 75 : 60, borderRadius: isFirst ? 37.5 : 30 }]}
                  />
                  <View style={[styles.podiumBadge, { backgroundColor: color }]}>
                    <Text style={styles.podiumBadgeText}>{item?.rank}</Text>
                  </View>
                  <Text style={[styles.podiumName, isFirst && { fontWeight: "700", color: "#111" }]} numberOfLines={1}>
                    {item?.fullName}
                  </Text>
                  <Text style={[styles.podiumPoints, isFirst && { color: "#00b3ff", fontWeight: "700" }]}>
                    {item?.points} pts
                  </Text>
                  <View style={[styles.podiumBlock, { height: blockHeights[idx], backgroundColor: `${color}20` }]}>
                    <Text style={styles.podiumBlockNum}>{item?.rank === 1 ? "1st" : item?.rank === 2 ? "2nd" : "3rd"}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Rankings 4+ */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Rankings</Text>
          {rest.map((item) => (
            <View key={item.id} style={styles.rankRow}>
              <Text style={styles.rankNum}>#{item.rank}</Text>
              <Image source={{ uri: item.avatar }} style={styles.rankAvatar} />
              <Text style={styles.rankName}>{item.fullName}</Text>
              <View style={styles.rankPointsBadge}>
                <Text style={styles.rankPoints}>{item.points} pts</Text>
              </View>
            </View>
          ))}

          {/* My rank row */}
          {myRank && (
            <View style={[styles.rankRow, styles.myRankRow]}>
              <Text style={[styles.rankNum, { color: "#00c2c2" }]}>#{myRank.rank}</Text>
              <Image source={{ uri: myRank.avatar }} style={styles.rankAvatar} />
              <Text style={[styles.rankName, { color: "#00c2c2", fontWeight: "700" }]}>
                {myRank.fullName} (You)
              </Text>
              <View style={[styles.rankPointsBadge, { backgroundColor: "#00c2c220" }]}>
                <Text style={[styles.rankPoints, { color: "#00c2c2" }]}>{myRank.points} pts</Text>
              </View>
            </View>
          )}
        </View>

        {/* My Points Summary */}
        {currentUser && (
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNum}>{currentUser.points || 0}</Text>
              <Text style={styles.summaryLabel}>My Points</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNum}>#{myRank?.rank || "—"}</Text>
              <Text style={styles.summaryLabel}>My Rank</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNum}>{currentUser.coursesCompleted || 0}</Text>
              <Text style={styles.summaryLabel}>Courses</Text>
            </View>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6f8" },
  centered:  { justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 14, backgroundColor: "#fff" },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#111" },
  podiumSection: { padding: 20 },
  podiumTitle: { fontSize: 18, fontWeight: "bold", color: "#111", marginBottom: 20, textAlign: "center" },
  podium: { flexDirection: "row", justifyContent: "center", alignItems: "flex-end", gap: 12 },
  podiumItem: { alignItems: "center", flex: 1, marginBottom: 10 },
  podiumAvatar: { borderWidth: 3, marginBottom: 4 },
  podiumBadge: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", marginBottom: 6 },
  podiumBadgeText: { color: "#fff", fontSize: 11, fontWeight: "bold" },
  podiumName: { fontSize: 12, fontWeight: "600", color: "#333", textAlign: "center", marginBottom: 2 },
  podiumPoints: { fontSize: 11, color: "#888", marginBottom: 8 },
  podiumBlock: { width: "100%", borderRadius: 12, alignItems: "center", justifyContent: "center", paddingVertical: 8 },
  podiumBlockNum: { fontSize: 12, fontWeight: "bold", color: "#888" },
  card: { backgroundColor: "#fff", marginHorizontal: 20, borderRadius: 20, padding: 18, marginBottom: 12, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#111", marginBottom: 12 },
  rankRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f5f5f5" },
  myRankRow: { borderBottomWidth: 0, borderTopWidth: 2, borderTopColor: "#00c2c220", marginTop: 8, paddingTop: 16 },
  rankNum: { fontSize: 14, fontWeight: "bold", color: "#aaa", width: 36 },
  rankAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  rankName: { flex: 1, fontSize: 15, fontWeight: "600", color: "#111" },
  rankPointsBadge: { backgroundColor: "#e8f9f9", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  rankPoints: { fontSize: 12, color: "#00c2c2", fontWeight: "600" },
  summaryRow: { flexDirection: "row", backgroundColor: "#fff", marginHorizontal: 20, borderRadius: 20, marginBottom: 12, paddingVertical: 20, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryNum: { fontSize: 22, fontWeight: "bold", color: "#00c2c2" },
  summaryLabel: { fontSize: 12, color: "#aaa", marginTop: 4 },
  summaryDivider: { width: 1, backgroundColor: "#f0f0f0" },
});