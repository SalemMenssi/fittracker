import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { getAllCourses, leaveCourse } from "../../services/CourseService";
import { getProfile } from "../../services/AuthService";
import { getTodayQuest, generateTodayQuest, getQuestProgress, regenerateQuest, activateQuest, resolveQuestId } from "../../services/DailyQuestService";
import { getIntelligenceProfile } from "../../services/IntelligenceService";
import { buildUserQuestProfile } from "../../services/IntelligenceService";
import IntelligenceRadarChart from "../../components/IntelligenceRadarChart";
import { RoutineCardCompact, RoutineCardRow } from "../../components/RoutineCard";
import { INTELLIGENCE_META, CORE_STAT_META, CORE_STAT_KEYS } from "../../data/intelligenceConstants";
import { resolveRankByLevel } from "../../services/SystemService";
import { useIsFocused } from "@react-navigation/native";
import { Alert } from "react-native";
import { ROUTES } from "../../navigation/routes";
import { openStackScreen } from "../../navigation/openStackScreen";

export default function HomeScreen({ navigation }) {
  const isFocused = useIsFocused();
  const [activeFilter, setActiveFilter] = useState("All Types");
  const filters = ["All Types", "Study", "Fitness", "Discipline", "Productivity", "Mental Focus", "Health", "Skill Building", "Daily Life"];
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dailyQuest, setDailyQuest] = useState(null);
  const [intelProfile, setIntelProfile] = useState(null);
  const [generatingQuest, setGeneratingQuest] = useState(false);

  const tabShortcuts = [
    { label: 'Quests', icon: 'sparkles-outline', tab: 'Quests' },
    { label: 'Routines', icon: 'barbell-outline', tab: 'Routines' },
    { label: 'Arena', icon: 'trophy-outline', tab: 'Arena' },
    { label: 'Profile', icon: 'person-circle-outline', tab: 'Profile' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const p = await getProfile();
        setUser(p);
        try {
          const [quest, profile] = await Promise.all([
            getTodayQuest().catch(() => null),
            getIntelligenceProfile().catch(() => null),
          ]);
          setDailyQuest(quest);
          setIntelProfile(profile);
        } catch (_) {}

        const allCourses = await getAllCourses();
        setCourses(allCourses || []);
      } catch (error) {
        console.error("Home loading error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isFocused) {
      fetchData();
    }
  }, [isFocused]);

  const handleLeave = async (courseId) => {
    Alert.alert(
      "Confirm",
      "Do you want to stop following this course?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            try {
              await leaveCourse(courseId);
              // Refresh data
              const p = await getProfile();
              setUser(p);
              const all = await getAllCourses();
              setCourses(all || []);
            } catch (e) {
              Alert.alert("Error", "Could not leave course.");
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#00c2c2" />
      </SafeAreaView>
    );
  }

  // Filter recommended courses (unjoined)
  const recommendedCourses = courses
    .filter(c => !c.Status)
    .filter(c => activeFilter === "All Types" || c.workoutType === activeFilter)
    .slice(0, 5); // take up to 5

  // Filter continue learning courses (joined ones)
  const continueLearning = courses.filter(c =>
    user?.joinedCourses?.some(jc => (jc._id || jc) === c.id)
  );

  const perfLevel = user?.performanceLevel || 1;
  const rank = user?.rank || resolveRankByLevel(perfLevel);
  const xpInLevel = (user?.xp || 0) % 100;
  const questProgress = dailyQuest ? getQuestProgress(dailyQuest) : 0;

  const handleGenerateQuest = async () => {
    setGeneratingQuest(true);
    try {
      const profile = buildUserQuestProfile(user);
      const quest = await generateTodayQuest(profile);
      setDailyQuest(quest);
    } catch (e) {
      Alert.alert("System", e.message || "Could not generate quest");
    } finally {
      setGeneratingQuest(false);
    }
  };

  const handleStartQuest = async () => {
    if (!dailyQuest) {
      await handleGenerateQuest();
      return;
    }
    if (dailyQuest.status === "pending") {
      try {
        const q = await activateQuest(resolveQuestId(dailyQuest));
        setDailyQuest(q);
      } catch (_) {}
    }
    openStackScreen(navigation, ROUTES.DAILY_QUEST_DETAIL, { quest: dailyQuest });
  };

  const handleRegenerateQuest = async () => {
    setGeneratingQuest(true);
    try {
      const profile = buildUserQuestProfile(user);
      const quest = await regenerateQuest(dailyQuest, profile);
      setDailyQuest(quest);
    } catch (e) {
      Alert.alert("System", e.message || "Could not regenerate quest");
    } finally {
      setGeneratingQuest(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f6f8" />

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* System Header */}
        <View style={styles.welcomeRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.welcomeSmall}>Welcome back, Hunter</Text>
            <Text style={styles.welcomeName}>{user?.fullName || 'Hunter'}</Text>
            <View style={styles.levelRow}>
              <Text style={styles.levelBadge}>Lv.{perfLevel}</Text>
              <Text style={styles.rankBadge}>{rank}</Text>
              <Text style={styles.classBadge}>{user?.classType || 'Balanced Hunter'}</Text>
            </View>
            <View style={styles.xpBarBg}>
              <View style={[styles.xpBarFill, { width: `${xpInLevel}%` }]} />
            </View>
            <Text style={styles.xpText}>{user?.xp || 0} XP · 🔥 {user?.dayStreak || 0} streak</Text>
          </View>
          <TouchableOpacity onPress={() => openStackScreen(navigation, ROUTES.PERSONAL_INFO)}>
            <View style={[styles.avatar, { borderWidth: 2, borderColor: '#00c2c2' }]}>
              <Image
                source={{ uri: user?.avatar || 'https://randomuser.me/api/portraits/men/32.jpg' }}
                style={styles.avatarImage}
              />
              <View style={styles.avatarEditBadge}>
                <Ionicons name="pencil" size={10} color="#fff" />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Daily Quest Card */}
        <View style={styles.questCard}>
          <Text style={styles.questLabel}>DAILY QUEST</Text>
          {dailyQuest ? (
            <>
              <Text style={styles.questTitle}>{dailyQuest.title}</Text>
              <Text style={styles.questCoach} numberOfLines={2}>{dailyQuest.coachMessage || dailyQuest.description}</Text>
              <Text style={styles.questMeta}>~{dailyQuest.estimatedDuration || 30} min · {questProgress}% complete</Text>
              <View style={styles.intelIcons}>
                {(dailyQuest.targetIntelligences || []).slice(0, 4).map((k) => {
                  const m = INTELLIGENCE_META[k];
                  return m ? <Ionicons key={k} name={m.icon} size={18} color={m.color} style={{ marginRight: 6 }} /> : null;
                })}
              </View>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${questProgress}%` }]} />
              </View>
            </>
          ) : (
            <Text style={styles.questEmpty}>No quest yet. The System awaits your command.</Text>
          )}
          <View style={styles.questBtns}>
            <TouchableOpacity style={styles.questBtnPrimary} onPress={handleStartQuest} disabled={generatingQuest}>
              <Text style={styles.questBtnText}>{dailyQuest ? "Start Quest" : "Generate Quest"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.questBtnSecondary} onPress={handleRegenerateQuest} disabled={generatingQuest}>
              <Text style={styles.questBtnSecText}>Regenerate AI</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Intelligence Radar */}
        <View style={styles.radarCard}>
          <Text style={styles.sectionTitleDark}>Intelligence Profile</Text>
          <IntelligenceRadarChart stats={intelProfile?.intelligenceStats || user?.intelligenceStats || {}} size={260} maxValue={5} />
          <TouchableOpacity onPress={() => openStackScreen(navigation, ROUTES.LINGUISTIC_DETAIL, { intelligenceKey: intelProfile?.weakestIntelligence || 'linguistic' })}>
            <Text style={styles.seeAll}>View details →</Text>
          </TouchableOpacity>
        </View>

        {/* Core Stats Grid */}
        <View style={styles.coreGrid}>
          {CORE_STAT_KEYS.map((k) => {
            const m = CORE_STAT_META[k];
            const val = user?.coreStats?.[k] ?? user?.stats?.[k] ?? 1;
            return (
              <View key={k} style={styles.coreCard}>
                <Ionicons name={m.icon} size={18} color="#00c2c2" />
                <Text style={styles.coreLabel}>{m.label}</Text>
                <Text style={styles.coreVal}>{typeof val === 'number' ? val.toFixed(1) : val}</Text>
              </View>
            );
          })}
        </View>

        {/* Recommended Development */}
        {intelProfile?.recommendation && (
          <View style={styles.recDevCard}>
            <Ionicons name="bulb-outline" size={20} color="#00c2c2" />
            <Text style={styles.recDevText}>{intelProfile.recommendation}</Text>
          </View>
        )}

        {/* Notification Status */}
        <TouchableOpacity style={styles.notifCard} onPress={() => openStackScreen(navigation, ROUTES.NOTIFICATIONS)}>
          <Ionicons name="notifications-outline" size={20} color="#00c2c2" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.notifTitle}>Notification Settings</Text>
            <Text style={styles.notifSub}>
              Daily quest: {user?.notificationSettings?.dailyQuestReminders !== false ? "On" : "Off"} ·
              Streak: {user?.notificationSettings?.streakReminders !== false ? "On" : "Off"}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#888" />
        </TouchableOpacity>

        {/* Weekly Goal Card */}
        <View style={styles.goalCard}>
          <Text style={styles.goalLabel}>WEEKLY GOAL</Text>
          <View style={styles.goalRow}>
            <Text style={styles.goalPercent}>{user?.weeklyGoalPercent || 0}% Completed</Text>
            <Ionicons name="trending-up-outline" size={24} color="#00c2c2" />
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${user?.weeklyGoalPercent || 0}%` }]} />
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="flame-outline" size={24} color="#ff8c42" />
              <View>
                <Text style={styles.statLabel}>Day Streak</Text>
                <Text style={styles.statValue}>{user?.dayStreak || 0} Days</Text>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={24} color="#00c2c2" />
              <View>
                <Text style={styles.statLabel}>Time Spent</Text>
                <Text style={styles.statValue}>{user?.timeSpentHours || 0} hrs</Text>
              </View>
            </View>
          </View>
        </View>

        {/* App sections */}
        <View style={styles.iconsRow}>
          {tabShortcuts.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.iconItem}
              onPress={() => navigation.navigate('User', { screen: item.tab })}
            >
              <View style={styles.iconCircle}>
                <Ionicons name={item.icon} size={28} color="#00c2c2" />
              </View>
              <Text style={styles.iconLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Suggested Routines */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Suggested for you</Text>
            <Text style={styles.sectionSub}>Routines you haven&apos;t started yet</Text>
          </View>
          <TouchableOpacity onPress={() => openStackScreen(navigation, ROUTES.COURSES)}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersRow}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, activeFilter === f && styles.filterBtnActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardsRow}>
          {recommendedCourses.map((course, index) => (
            <RoutineCardCompact
              key={course.id}
              index={index}
              routine={course}
              onPress={() => openStackScreen(navigation, ROUTES.COURSE_DETAIL, { Item: course })}
            />
          ))}
          {recommendedCourses.length === 0 && (
            <Text style={styles.emptyHint}>No routines match this filter.</Text>
          )}
        </ScrollView>

        {/* Active Routines */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Your active routines</Text>
            <Text style={styles.sectionSub}>{continueLearning.length} in progress</Text>
          </View>
        </View>

        {continueLearning.length === 0 ? (
          <Text style={styles.emptyHintBlock}>
            No active routines yet. Browse suggested routines above to get started.
          </Text>
        ) : (
          continueLearning.map((item, index) => (
            <RoutineCardRow
              key={item.id}
              index={index}
              routine={item}
              showActions
              onPress={() => openStackScreen(navigation, ROUTES.COURSE_DETAIL, { Item: item })}
              onEdit={() => openStackScreen(navigation, ROUTES.COURSE_DETAIL, { Item: item, editMode: true })}
              onLeave={() => handleLeave(item.id)}
            />
          ))
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{user?.email}</Text>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6f8",
    paddingTop: 25
  },
  welcomeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  welcomeSmall: {
    fontSize: 14,
    color: "#888",
  },
  welcomeName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    backgroundColor: "#ddd",
  },
  avatarEditBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#00c2c2",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  goalCard: {
    backgroundColor: "#111",
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  goalLabel: {
    fontSize: 12,
    color: "#aaa",
    letterSpacing: 1,
    marginBottom: 8,
  },
  goalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  goalPercent: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  progressBg: {
    height: 8,
    backgroundColor: "#333",
    borderRadius: 4,
    marginVertical: 16,
  },
  progressFill: {
    height: 8,
    backgroundColor: "#00c2c2",
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#333",
    marginHorizontal: 12,
  },
  statLabel: {
    fontSize: 12,
    color: "#aaa",
  },
  statValue: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
  },
  iconsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    marginBottom: 24,
    rowGap: 14,
  },
  iconItem: {
    alignItems: "center",
    gap: 8,
    width: "30%",
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconLabel: {
    fontSize: 12,
    color: "#555",
    fontWeight: "500",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
  },
  sectionSub: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  emptyHint: {
    color: '#888',
    paddingHorizontal: 20,
    fontSize: 14,
  },
  emptyHintBlock: {
    color: '#888',
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  seeAll: {
    fontSize: 14,
    color: "#00c2c2",
    fontWeight: "600",
  },
  activeText: {
    fontSize: 14,
    color: "#888",
  },
  cardsRow: {
    paddingLeft: 20,
    marginBottom: 20,
  },
  recCard: {
    marginRight: 15,
    borderRadius: 16,
    overflow: "hidden",
    width: 180,
    height: 120,
  },
  recCardImage: {
    width: "100%",
    height: "100%",
  },
  recCardOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  recCardBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#00c2c2",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 6,
  },
  recCardBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  recCardTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  filtersRow: {
    paddingLeft: 20,
    marginBottom: 20,
  },
  filterBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: "#fff",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  filterBtnActive: {
    backgroundColor: "#00c2c2",
    borderColor: "#00c2c2",
  },
  filterText: {
    fontSize: 14,
    color: "#555",
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  learnCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  learnThumb: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  learnInfo: {
    flex: 1,
    marginRight: 15,
  },
  learnTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
    marginBottom: 4,
  },
  learnSubtitle: {
    fontSize: 12,
    color: "#888",
    marginBottom: 8,
  },
  learnProgressBg: {
    height: 4,
    backgroundColor: "#eee",
    borderRadius: 2,
  },
  learnProgressFill: {
    height: 4,
    borderRadius: 2,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 20,
    marginTop: 10,
  },
  footerText: {
    fontSize: 12,
    color: "#aaa",
  },
  learnActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  levelRow: { flexDirection: "row", gap: 8, marginTop: 6, flexWrap: "wrap" },
  levelBadge: { fontSize: 11, color: "#00c2c2", fontWeight: "700", backgroundColor: "#00c2c222", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  rankBadge: { fontSize: 11, color: "#f4c542", fontWeight: "700" },
  classBadge: { fontSize: 11, color: "#888" },
  xpBarBg: { height: 6, backgroundColor: "#eee", borderRadius: 3, marginTop: 8, width: "90%", overflow: "hidden" },
  xpBarFill: { height: "100%", backgroundColor: "#00c2c2" },
  xpText: { fontSize: 11, color: "#888", marginTop: 4 },
  questCard: { backgroundColor: "#1a2332", marginHorizontal: 20, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#00c2c233" },
  questLabel: { fontSize: 11, color: "#00c2c2", letterSpacing: 1, fontWeight: "700" },
  questTitle: { fontSize: 18, fontWeight: "700", color: "#fff", marginTop: 6 },
  questCoach: { fontSize: 13, color: "#8a9bb0", marginTop: 6, fontStyle: "italic" },
  questMeta: { fontSize: 12, color: "#00c2c2", marginTop: 6 },
  questEmpty: { color: "#8a9bb0", marginTop: 8 },
  intelIcons: { flexDirection: "row", marginTop: 8 },
  questBtns: { flexDirection: "row", gap: 10, marginTop: 14 },
  questBtnPrimary: { flex: 1, backgroundColor: "#00c2c2", padding: 12, borderRadius: 10, alignItems: "center" },
  questBtnSecondary: { padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#00c2c2" },
  questBtnText: { color: "#0d1117", fontWeight: "700" },
  questBtnSecText: { color: "#00c2c2", fontWeight: "600", fontSize: 12 },
  radarCard: { backgroundColor: "#fff", marginHorizontal: 20, borderRadius: 16, padding: 16, marginBottom: 16 },
  sectionTitleDark: { fontSize: 16, fontWeight: "700", color: "#111", marginBottom: 12 },
  coreGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 8, marginBottom: 16 },
  coreCard: { width: "30%", backgroundColor: "#1a2332", borderRadius: 12, padding: 10, alignItems: "center" },
  coreLabel: { fontSize: 10, color: "#8a9bb0", marginTop: 4 },
  coreVal: { fontSize: 14, color: "#fff", fontWeight: "700" },
  recDevCard: { flexDirection: "row", backgroundColor: "#e8f9f9", marginHorizontal: 20, padding: 14, borderRadius: 12, marginBottom: 16, alignItems: "flex-start", gap: 8 },
  recDevText: { flex: 1, color: "#333", fontSize: 13, lineHeight: 20 },
  notifCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", marginHorizontal: 20, padding: 14, borderRadius: 12, marginBottom: 16 },
  notifTitle: { fontWeight: "600", color: "#111" },
  notifSub: { fontSize: 11, color: "#888", marginTop: 2 },
});