import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, Alert } from "react-native";
import { getAllChallenges, joinChallenge, completeChallenge } from "../../services/ChallengeService";
import { getProfile } from "../../services/AuthService";
import BadgeUnlockModal from "../../components/BadgeUnlockModal";
import { notifyBadgeUnlock } from "../../services/notificationService";
import BackButton from "../../components/BackButton";

export default function ChallengesScreen({ navigation }) {
  const [challenges, setChallenges] = useState([]);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [category, setCategory] = useState("all");
  const [levelReq, setLevelReq] = useState("all");
  const [unlockedBadges, setUnlockedBadges] = useState([]);

  const load = async () => {
    const [list, profile] = await Promise.all([
      getAllChallenges().catch(() => []),
      getProfile().catch(() => null),
    ]);
    setChallenges(list);
    setUser(profile);
  };

  useEffect(() => { load(); }, []);

  const joinedIds = (user?.joinedChallenges || []).map((c) => String(c._id || c));
  const completedIds = (user?.completedChallenges || []).map((c) => String(c._id || c));

  const filtered = challenges.filter((c) => {
    const statusOk = filter === "all" || c.status === filter;
    const difficultyOk = difficulty === "all" || c.difficulty === difficulty;
    const categoryOk = category === "all" || c.category === category;
    const levelOk = levelReq === "all" || (c.levelRequirement || 1) <= Number(levelReq);
    const expiryOk = filter !== "open" || new Date(c.expiryDate) >= new Date();
    return statusOk && difficultyOk && categoryOk && levelOk && expiryOk;
  });

  const showBadges = (badges) => {
    if (!badges?.length) return;
    setUnlockedBadges(badges);
    badges.forEach((b) => notifyBadgeUnlock(b.label));
  };

  const onJoin = async (challenge) => {
    if (new Date(challenge.expiryDate) < new Date()) return Alert.alert("System", "This challenge has expired.");
    try {
      const res = await joinChallenge(challenge.id);
      showBadges(res.unlockedBadges);
      Alert.alert("System", res.message || "Challenge accepted.");
      load();
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const onComplete = async (challenge) => {
    try {
      const res = await completeChallenge(challenge.id);
      showBadges(res.unlockedBadges);
      Alert.alert("System", `${res.message || "Completed"}. +${res.xpReward || 0} XP`);
      load();
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topRow}>
        <BackButton navigation={navigation} />
      </View>
      <Text style={styles.title}>Daily Challenges</Text>
      <View style={styles.filters}>
        {["all", "open", "expired", "completed"].map((f) => (
          <TouchableOpacity key={f} onPress={() => setFilter(f)} style={[styles.chip, filter === f && styles.chipActive]}>
            <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>{f.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const joined = joinedIds.includes(String(item.id));
          const done = completedIds.includes(String(item.id));
          return (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.meta}>{item.category} • {item.difficulty} • +{item.expReward} EXP</Text>
              <Text style={styles.meta}>Join before: {new Date(item.expiryDate).toLocaleDateString()}</Text>
              {!joined && (
                <TouchableOpacity style={styles.btn} onPress={() => onJoin(item)}>
                  <Text style={styles.btnText}>Join Challenge</Text>
                </TouchableOpacity>
              )}
              {joined && !done && (
                <TouchableOpacity style={[styles.btn, styles.btnComplete]} onPress={() => onComplete(item)}>
                  <Text style={styles.btnText}>Complete Challenge</Text>
                </TouchableOpacity>
              )}
              {done && <Text style={styles.doneLabel}>Completed ✓</Text>}
            </View>
          );
        }}
      />
      <BadgeUnlockModal
        visible={unlockedBadges.length > 0}
        badges={unlockedBadges}
        onClose={() => setUnlockedBadges([])}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6f8", padding: 20 },
  topRow: { marginBottom: 4 },
  title: { fontSize: 28, fontWeight: "bold", color: "#111", marginBottom: 12 },
  filters: { flexDirection: "row", marginBottom: 12, gap: 8, flexWrap: "wrap" },
  chip: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 7 },
  chipActive: { backgroundColor: "#00c2c2", borderColor: "#00c2c2" },
  chipText: { color: "#666", fontSize: 11, fontWeight: "600" },
  chipTextActive: { color: "#fff" },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#111" },
  meta: { color: "#666", marginTop: 4, fontSize: 12 },
  btn: { marginTop: 12, backgroundColor: "#00c2c2", borderRadius: 12, paddingVertical: 10, alignItems: "center" },
  btnComplete: { backgroundColor: "#111" },
  btnText: { color: "#fff", fontWeight: "700" },
  doneLabel: { marginTop: 12, color: "#2ecc71", fontWeight: "700" },
});
