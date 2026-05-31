import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, TouchableOpacity, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { computeEarnedBadges, BADGE_DEFINITIONS, getAchievementDates } from "../../services/AchievementService";
import { getAllCourses } from "../../services/CourseService";
import { getCurrentUser } from "../../services/AuthService";
import { useIsFocused } from "@react-navigation/native";

export default function AwardsScreen({ navigation }) {
  const isFocused = useIsFocused();
  const [earnedBadges, setEarnedBadges]   = useState([]);
  const [lockedBadges, setLockedBadges]   = useState([]);
  const [currentUser, setCurrentUser]     = useState(null);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [user, courses, dates] = await Promise.all([
          getCurrentUser(),
          getAllCourses(),
          getAchievementDates(),
        ]);
        setCurrentUser(user);

        const earned = computeEarnedBadges(user, courses).map((b) => ({
          ...b,
          date: dates[b.id] || b.date,
        }));
        const earnedIds = new Set(earned.map((b) => b.id));
        const locked = BADGE_DEFINITIONS.filter((b) => !earnedIds.has(b.id));

        setEarnedBadges(earned);
        setLockedBadges(locked);
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back-outline" size={26} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Awards</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNum}>{earnedBadges.length}</Text>
            <Text style={styles.summaryLabel}>Earned</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNum}>{lockedBadges.length}</Text>
            <Text style={styles.summaryLabel}>Locked</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNum}>
              {BADGE_DEFINITIONS.length > 0
                ? Math.round((earnedBadges.length / BADGE_DEFINITIONS.length) * 100) + "%"
                : "0%"}
            </Text>
            <Text style={styles.summaryLabel}>Completed</Text>
          </View>
        </View>

        {/* Points card */}
        {currentUser && (
          <View style={styles.pointsCard}>
            <Ionicons name="star" size={28} color="#f4c542" />
            <View style={{ marginLeft: 14 }}>
              <Text style={styles.pointsValue}>{currentUser.points || 0} pts</Text>
              <Text style={styles.pointsLabel}>Total Points Earned</Text>
            </View>
            <View style={{ flex: 1 }} />
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={16} color="#ff8c42" />
              <Text style={styles.streakText}>{currentUser.dayStreak || 0}d streak</Text>
            </View>
          </View>
        )}

        {/* Earned Badges */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="checkmark-circle" size={18} color="#2ecc71" />
            <Text style={styles.cardTitle}> Earned Badges</Text>
          </View>
          {earnedBadges.length === 0 ? (
            <Text style={styles.emptyText}>Join a course to start earning badges!</Text>
          ) : (
            earnedBadges.map((b, i) => (
              <View key={b.id} style={[styles.badgeRow, i === earnedBadges.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={[styles.badgeCircle, { backgroundColor: b.bg, borderColor: b.color }]}>
                  <Ionicons name={b.icon} size={26} color={b.color} />
                </View>
                <View style={styles.badgeInfo}>
                  <Text style={styles.badgeName}>{b.label}</Text>
                  <Text style={styles.badgeDesc}>{b.desc}</Text>
                </View>
                <Text style={styles.badgeDate}>{b.date}</Text>
              </View>
            ))
          )}
        </View>

        {/* Locked Badges */}
        {lockedBadges.length > 0 && (
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Ionicons name="lock-closed-outline" size={18} color="#aaa" />
              <Text style={[styles.cardTitle, { color: "#aaa" }]}> Locked Badges</Text>
            </View>
            {lockedBadges.map((b, i) => (
              <View key={b.id} style={[styles.badgeRow, i === lockedBadges.length - 1 && { borderBottomWidth: 0 }, { opacity: 0.45 }]}>
                <View style={[styles.badgeCircle, { backgroundColor: "#f0f0f0", borderColor: "#ddd" }]}>
                  <Ionicons name={b.icon} size={26} color="#bbb" />
                </View>
                <View style={styles.badgeInfo}>
                  <Text style={styles.badgeName}>{b.label}</Text>
                  <Text style={styles.badgeDesc}>{b.desc}</Text>
                </View>
                <Ionicons name="lock-closed" size={14} color="#ccc" />
              </View>
            ))}
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
  summaryRow: { flexDirection: "row", backgroundColor: "#fff", marginHorizontal: 20, borderRadius: 20, marginVertical: 12, paddingVertical: 20, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryNum: { fontSize: 22, fontWeight: "bold", color: "#00c2c2" },
  summaryLabel: { fontSize: 12, color: "#aaa", marginTop: 4 },
  summaryDivider: { width: 1, backgroundColor: "#f0f0f0" },
  pointsCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", marginHorizontal: 20, borderRadius: 20, padding: 18, marginBottom: 12, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  pointsValue: { fontSize: 22, fontWeight: "bold", color: "#111" },
  pointsLabel: { fontSize: 12, color: "#aaa", marginTop: 2 },
  streakBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff3e8", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, gap: 4 },
  streakText: { fontSize: 13, color: "#ff8c42", fontWeight: "700" },
  card: { backgroundColor: "#fff", marginHorizontal: 20, borderRadius: 20, padding: 18, marginBottom: 12, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#111" },
  emptyText: { fontSize: 14, color: "#aaa", textAlign: "center", paddingVertical: 20 },
  badgeRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#f5f5f5", gap: 14 },
  badgeCircle: { width: 54, height: 54, borderRadius: 27, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  badgeInfo: { flex: 1 },
  badgeName: { fontSize: 15, fontWeight: "600", color: "#111", marginBottom: 3 },
  badgeDesc: { fontSize: 12, color: "#aaa" },
  badgeDate: { fontSize: 11, color: "#00c2c2", fontWeight: "500" },
});