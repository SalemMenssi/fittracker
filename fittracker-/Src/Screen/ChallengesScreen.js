import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, Alert } from "react-native";
import { getAllChallenges, joinChallenge } from "../services/ChallengeService";
import { gainXP } from "../services/performanceService";
import { markAchievementEarned } from "../services/AchievementService";

export default function ChallengesScreen() {
  const [challenges, setChallenges] = useState([]);
  const [filter, setFilter] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [category, setCategory] = useState("all");
  const [levelReq, setLevelReq] = useState("all");

  useEffect(() => {
    getAllChallenges().then(setChallenges).catch(() => setChallenges([]));
  }, []);

  const filtered = challenges.filter((c) => {
    const statusOk = filter === "all" || c.status === filter;
    const difficultyOk = difficulty === "all" || c.difficulty === difficulty;
    const categoryOk = category === "all" || c.category === category;
    const levelOk = levelReq === "all" || (c.levelRequirement || 1) <= Number(levelReq);
    const expiryOk = filter !== "open" || new Date(c.expiryDate) >= new Date();
    return statusOk && difficultyOk && categoryOk && levelOk && expiryOk;
  });

  const onJoin = async (challenge) => {
    if (new Date(challenge.expiryDate) < new Date()) return Alert.alert("System", "Penalty Zone: this challenge has expired.");
    await joinChallenge(challenge.id);
    await markAchievementEarned("challenge_accepted");
    await gainXP(10);
    Alert.alert("System", "Challenge accepted.");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Daily Challenges</Text>
      <View style={styles.filters}>
        {["all", "open", "expired", "completed"].map((f) => (
          <TouchableOpacity key={f} onPress={() => setFilter(f)} style={[styles.chip, filter === f && styles.chipActive]}>
            <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>{f.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.filters}>
        {["all", "Easy", "Medium", "Hard"].map((f) => (
          <TouchableOpacity key={f} onPress={() => setDifficulty(f)} style={[styles.chip, difficulty === f && styles.chipActive]}>
            <Text style={[styles.chipText, difficulty === f && styles.chipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.filters}>
        {["all", "Study", "Fitness", "Discipline", "Productivity", "Mental Focus", "Health", "Skill Building", "Daily Life"].map((f) => (
          <TouchableOpacity key={f} onPress={() => setCategory(f)} style={[styles.chip, category === f && styles.chipActive]}>
            <Text style={[styles.chipText, category === f && styles.chipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.filters}>
        {["all", "1", "3", "5"].map((f) => (
          <TouchableOpacity key={f} onPress={() => setLevelReq(f)} style={[styles.chip, levelReq === f && styles.chipActive]}>
            <Text style={[styles.chipText, levelReq === f && styles.chipTextActive]}>L{f}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.meta}>{item.category} • {item.difficulty} • +{item.expReward} EXP</Text>
            <Text style={styles.meta}>Join before: {new Date(item.expiryDate).toLocaleDateString()}</Text>
            <TouchableOpacity style={styles.btn} onPress={() => onJoin(item)}>
              <Text style={styles.btnText}>Join Challenge</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6f8", padding: 20 },
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
  btnText: { color: "#fff", fontWeight: "700" },
});
