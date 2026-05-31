import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
  Modal,
} from "react-native";
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { getProfile, logout } from "../../services/AuthService";
import { getPerformanceMetrics } from "../../services/performanceService";
import { computeEarnedBadges, BADGE_DEFINITIONS } from "../../services/AchievementService";
import { getAllCourses } from "../../services/CourseService";
import { askSystem } from "../../services/SystemAIService";
import { getIntelligenceProfile } from "../../services/IntelligenceService";
import IntelligenceRadarChart from "../../components/IntelligenceRadarChart";
import { INTELLIGENCE_META, INTELLIGENCE_KEYS } from "../../data/intelligenceConstants";
import { useIsFocused } from "@react-navigation/native";
import { ROUTES } from "../../navigation/routes";
import { openStackScreen } from "../../navigation/openStackScreen";

export default function ProfileScreen({ navigation }) {
  const isFocused = useIsFocused();
  const [user, setUser] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [systemOpen, setSystemOpen] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [systemReply, setSystemReply] = useState("");
  const [systemLoading, setSystemLoading] = useState(false);
  const [talkFrame, setTalkFrame] = useState(0);
  const [intelProfile, setIntelProfile] = useState(null);
  const systemRequestRef = useRef(false);

  const openSystemModal = () => {
    setSystemPrompt("");
    setSystemReply("");
    setSystemOpen(true);
  };

  const closeSystemModal = () => {
    setSystemOpen(false);
    setSystemLoading(false);
    systemRequestRef.current = false;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [u, m, c] = await Promise.all([
          getProfile(),
          getPerformanceMetrics(),
          getAllCourses()
        ]);
        setUser(u);
        setMetrics(m);
        
        const earned = computeEarnedBadges(u, c);
        setEarnedBadges(earned);
        try {
          const ip = await getIntelligenceProfile();
          setIntelProfile(ip);
        } catch (_) {}
      } finally {
        setLoading(false);
      }
    };
    if (isFocused) fetchData();
  }, [isFocused]);

  useEffect(() => {
    if (!systemLoading) return;
    const id = setInterval(() => setTalkFrame((f) => (f + 1) % 3), 240);
    return () => clearInterval(id);
  }, [systemLoading]);

  const handleLogout = async () => {
    await logout();
    navigation.reset({ index: 0, routes: [{ name: ROUTES.LOGIN }] });
  };

  const settings = [
    { icon: 'person-outline', label: 'Personal Information', screen: ROUTES.PERSONAL_INFO, color: '#333' },
    { icon: 'notifications-outline', label: 'Notifications', screen: ROUTES.NOTIFICATIONS, color: '#333' },
    { icon: 'lock-closed-outline', label: 'Privacy & Security', screen: ROUTES.PRIVACY_SECURITY, color: '#333' },
    { icon: 'stats-chart-outline', label: 'Performance Stats', screen: ROUTES.STATS, color: '#333' },
    { icon: 'school-outline', label: 'Skills Tests', screen: ROUTES.TESTS_LIST, color: '#333' },
    { icon: 'flash-outline', label: 'Challenges', screen: ROUTES.CHALLENGES, color: '#333' },
    { icon: 'podium-outline', label: 'Leaderboard', screen: ROUTES.LEADERBOARD, color: '#333' },
    { icon: 'people-outline', label: 'Social Feed', screen: ROUTES.SOCIAL, color: '#333' },
    { icon: 'fitness-outline', label: 'Activity Tracker', screen: ROUTES.WORKOUTS, color: '#333' },
  ];

  // Top 3 achievements to display
  const displayAchievements = earnedBadges.length > 0
    ? earnedBadges.slice(0, 3)
    : BADGE_DEFINITIONS.slice(0, 3).map((b) => ({ ...b, locked: true }));

  const sendSystemPrompt = async () => {
    if (systemRequestRef.current) return;
    const currentPrompt = (systemPrompt || "").trim();
    if (!currentPrompt) {
      setSystemReply("Type your question first.");
      return;
    }
    try {
      systemRequestRef.current = true;
      setSystemLoading(true);
      setSystemReply("");
      setSystemPrompt("");
      const text = await askSystem(currentPrompt);
      setSystemReply(text || "No response from the System.");
    } catch (e) {
      setSystemReply(e?.message || "System unavailable. Try again.");
    } finally {
      setSystemLoading(false);
      systemRequestRef.current = false;
    }
  };
  const skillMapping = [
    { label: 'Discipline', key: 'discipline' },
    { label: 'IQ', key: 'iq' },
    { label: 'Strength', key: 'strength' },
    { label: 'Social', key: 'social' },
    { label: 'Knowledge', key: 'socialKnowledge' },
  ];
  const weeklyData = [42, 55, 48, 70, 65, 80, 58];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const maxValue = 100;

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#00c2c2" />
      </SafeAreaView>
    );
  }

  const stats = [
    { value: metrics?.performanceLevel || "1", label: "LEVEL" },
    { value: user?.weight || "78", label: user?.unit === "metric" ? "KG" : "LB" },
    { value: user?.height || "182", label: user?.unit === "metric" ? "CM" : "FT" },
    { value: metrics?.streakDays?.toString() || "0", label: "STREAK" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Profile Info */}
        <TouchableOpacity
          style={styles.profileSection}
          onPress={() => openStackScreen(navigation, ROUTES.PERSONAL_INFO)}
          activeOpacity={0.7}
        >
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: user?.avatar || 'https://randomuser.me/api/portraits/men/32.jpg' }}
              style={styles.avatar}
            />
            <View style={styles.avatarBadge}>
              <Ionicons name="camera" size={13} color="#fff" />
            </View>
          </View>
          <Text style={styles.profileName}>{user?.fullName || "Athlete"}</Text>
          <Text style={styles.profileSub}>{metrics?.classType || "Novice"} · {metrics?.rank || "E-Rank"} · Level {metrics?.performanceLevel || 1}</Text>
          {user?.isAdmin && (
            <View style={styles.proBadge}>
              <Ionicons name="shield-checkmark-outline" size={12} color="#00c2c2" />
              <Text style={styles.proBadgeText}>ADMIN PROFILE</Text>
            </View>
          )}
          {user?.isPro && (
            <View style={styles.proBadge}>
              <Ionicons name="diamond-outline" size={12} color="#00c2c2" />
              <Text style={styles.proBadgeText}>FITTRACKER PRO</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Avatar Evolution */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Avatar Evolution</Text>
          <Text style={styles.cardSubtitle}>Tier {user?.avatarTier || 1} · {user?.classType || 'Balanced Hunter'}</Text>
          {user?.equippedAura ? <Text style={styles.cardSubtitle}>Aura: {user.equippedAura}</Text> : null}
          <Text style={{ fontSize: 12, color: '#888', marginTop: 6 }}>
            Next evolution: Level {(user?.performanceLevel || 1) + 1}
          </Text>
        </View>

        {/* Intelligence Profile */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Intelligence Profile</Text>
          <IntelligenceRadarChart stats={intelProfile?.intelligenceStats || user?.intelligenceStats || {}} size={240} maxValue={5} />
          <Text style={{ marginTop: 8, color: '#555', fontSize: 13 }}>
            Strongest: {INTELLIGENCE_META[intelProfile?.strongestIntelligence]?.label || '—'}
          </Text>
          <Text style={{ color: '#555', fontSize: 13 }}>
            Weakest: {INTELLIGENCE_META[intelProfile?.weakestIntelligence]?.label || '—'}
          </Text>
          {intelProfile?.recommendation ? (
            <Text style={{ marginTop: 8, color: '#00c2c2', fontSize: 13, fontStyle: 'italic' }}>{intelProfile.recommendation}</Text>
          ) : null}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
            {INTELLIGENCE_KEYS.map((k) => (
              <TouchableOpacity
                key={k}
                style={{ marginRight: 10, alignItems: 'center' }}
                onPress={() => openStackScreen(navigation, INTELLIGENCE_META[k].screen, { intelligenceKey: k })}
              >
                <Ionicons name={INTELLIGENCE_META[k].icon} size={24} color={INTELLIGENCE_META[k].color} />
                <Text style={{ fontSize: 10, color: '#888' }}>{INTELLIGENCE_META[k].short}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Inventory Preview */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Inventory</Text>
          <Text style={styles.cardSubtitle}>Coins: {user?.coins || 0}</Text>
          <TouchableOpacity onPress={() => openStackScreen(navigation, ROUTES.MARKETPLACE)}>
            <Text style={{ color: '#00c2c2', marginTop: 8 }}>Open Marketplace →</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {stats.map((s, i) => (
            <View
              key={i}
              style={[styles.statItem, i === stats.length - 1 && styles.statItemLast]}
            >
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Weekly Activity */}
        <View style={styles.card}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.cardTitle}>Weekly Activity</Text>
              <Text style={styles.cardSubtitle}>Minutes spent exercising</Text>
            </View>
            <View style={styles.chartBadge}>
              <Text style={styles.chartBadgeText}>340m</Text>
              <View style={styles.chartBadgeSub}>
                <MaterialIcons name="trending-up" size={12} color="#2ecc71" />
                <Text style={styles.chartBadgeSubText}>+12% vs LW</Text>
              </View>
            </View>
          </View>
          <View style={styles.chartContainer}>
            {weeklyData.map((value, index) => (
              <View key={index} style={styles.barWrapper}>
                <View style={styles.barContainer}>
                  <View style={[styles.bar, { height: (value / maxValue) * 80 }]} />
                </View>
                <Text style={styles.barLabel}>{days[index]}</Text>
              </View>
            ))}
          </View>

          {/* Performance Metrics */}
          <View style={styles.radarContainer}>
            <Text style={styles.radarTitle}>Performance Metrics</Text>
            <View style={styles.radarGrid}>
              {skillMapping.map((skill, idx) => {
                const value = metrics?.stats?.[skill.key] || 0;
                // Cap at 100 for visual
                const displayWidth = Math.min(value, 100);
                return (
                  <View key={idx} style={styles.skillRow}>
                    <Text style={styles.skillLabel}>{skill.label}</Text>
                    <View style={styles.skillBarBg}>
                      <View style={[styles.skillBar, { width: `${displayWidth}%` }]} />
                    </View>
                    <Text style={{fontSize: 10, color: '#999', width: 25, textAlign: 'right'}}>{value}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleWrapper}>
              <Ionicons name="medal-outline" size={18} color="#ff8c42" />
              <Text style={styles.cardTitle}> Achievements</Text>
            </View>
            <TouchableOpacity onPress={() => openStackScreen(navigation, ROUTES.AWARDS)}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.achievementsRow}>
            {displayAchievements.map((a, i) => (
              <View
                key={i}
                style={[styles.achieveItem, a.locked && { opacity: 0.5 }]}
              >
                <View style={[
                  styles.achieveCircle, 
                  { 
                    backgroundColor: a.locked ? "#f0f0f0" : (a.bg || a.bgColor), 
                    borderColor: a.locked ? "#ddd" : a.color 
                  }
                ]}>
                  <Ionicons 
                    name={a.icon} 
                    size={28} 
                    color={a.locked ? "#bbb" : a.color} 
                  />
                </View>
                <Text style={styles.achieveLabel}>{a.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>The System</Text>
          <TouchableOpacity style={styles.systemBtn} onPress={openSystemModal}>
            <Ionicons name="sparkles-outline" size={18} color="#fff" />
            <Text style={styles.systemBtnText}>Ask the System</Text>
          </TouchableOpacity>
        </View>

        {/* Account Settings */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Settings</Text>
          <View style={styles.settingsList}>
            {settings.map((s, i) => (
              <TouchableOpacity
                key={i}
                style={styles.settingRow}
                onPress={() => openStackScreen(navigation, s.screen)}
                activeOpacity={0.7}
              >
                <View style={styles.settingIconWrapper}>
                  <Ionicons name={s.icon} size={20} color="#666" />
                </View>
                <Text style={styles.settingLabel}>{s.label}</Text>
                <Ionicons name="chevron-forward-outline" size={18} color="#ccc" />
              </TouchableOpacity>
            ))}

            {/* Sign Out */}
            <TouchableOpacity
              style={[styles.settingRow, styles.signOutRow]}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <View style={styles.settingIconWrapper}>
                <Ionicons name="log-out-outline" size={20} color="#e74c3c" />
              </View>
              <Text style={[styles.settingLabel, { color: "#e74c3c" }]}>Sign Out</Text>
              <Ionicons name="chevron-forward-outline" size={18} color="#e74c3c" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
      <Modal transparent visible={systemOpen} animationType="fade" onRequestClose={closeSystemModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.systemHeader}>
              <View style={styles.systemOrb}>
                <Ionicons name="sparkles-outline" size={16} color="#00c2c2" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Ask the System</Text>
                <Text style={styles.systemSub}>Awakening Console</Text>
              </View>
              <Text style={styles.talkDots}>{systemLoading ? ['●○○', '○●○', '○○●'][talkFrame] : '○○○'}</Text>
            </View>
            <TextInput
              value={systemPrompt}
              onChangeText={setSystemPrompt}
              style={styles.systemInput}
              placeholder="What should I do today?"
              placeholderTextColor="#888"
              multiline
              editable={!systemLoading}
            />
            <TouchableOpacity
              style={[styles.systemBtn, systemLoading && { opacity: 0.7 }]}
              disabled={systemLoading}
              onPress={sendSystemPrompt}
            >
              <Text style={styles.systemBtnText}>{systemLoading ? 'Thinking...' : 'Send'}</Text>
            </TouchableOpacity>
            <View style={styles.systemBubble}>
              <Ionicons name="chatbubble-ellipses-outline" size={14} color="#00c2c2" />
              <Text style={styles.systemOutput}>
                {systemLoading ? 'The System is analyzing your request...' : (systemReply || 'System standing by.')}
              </Text>
            </View>
            <TouchableOpacity onPress={closeSystemModal} style={styles.closeLink}>
              <Text style={styles.viewAll}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6f8" },
  scrollContent: { paddingTop: 8 },
  profileSection: {
    alignItems: "center",
    backgroundColor: "#fff",
    paddingBottom: 24,
    marginBottom: 12,
  },
  avatarWrapper: { position: "relative", marginTop: 16, marginBottom: 12 },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: "#00c2c2" },
  avatarBadge: {
    position: "absolute", bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: "#00c2c2", alignItems: "center", justifyContent: "center",
  },
  profileName: { fontSize: 22, fontWeight: "bold", color: "#111", marginBottom: 6 },
  profileSub: { fontSize: 13, color: "#888", marginBottom: 12 },
  proBadge: {
    flexDirection: "row", backgroundColor: "#e8f9f9",
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, gap: 6,
  },
  proBadgeText: { fontSize: 11, color: "#00c2c2", fontWeight: "700", letterSpacing: 1 },
  statsRow: {
    flexDirection: "row", backgroundColor: "#fff",
    marginHorizontal: 20, borderRadius: 16, marginBottom: 12, paddingVertical: 16,
  },
  statItem: { flex: 1, alignItems: "center", borderRightWidth: 1, borderRightColor: "#f0f0f0" },
  statItemLast: { borderRightWidth: 0 },
  statValue: { fontSize: 20, fontWeight: "bold", color: "#111" },
  statLabel: { fontSize: 10, color: "#aaa", marginTop: 4, letterSpacing: 0.5 },
  card: {
    backgroundColor: "#fff", marginHorizontal: 20, borderRadius: 20,
    padding: 18, marginBottom: 12, elevation: 2,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#111" },
  cardSubtitle: { fontSize: 12, color: "#aaa", marginTop: 2 },
  chartHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  chartBadge: { alignItems: "flex-end" },
  chartBadgeText: { fontSize: 20, fontWeight: "bold", color: "#00c2c2" },
  chartBadgeSub: { flexDirection: "row", alignItems: "center", gap: 4 },
  chartBadgeSubText: { fontSize: 11, color: "#2ecc71" },
  chartContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", height: 120, marginBottom: 20 },
  barWrapper: { alignItems: "center", flex: 1 },
  barContainer: { height: 80, justifyContent: "flex-end", width: 30 },
  bar: { width: 24, backgroundColor: "#00c2c2", borderRadius: 6, minHeight: 4 },
  barLabel: { fontSize: 10, color: "#888", marginTop: 6 },
  radarContainer: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#f0f0f0" },
  radarTitle: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 12 },
  radarGrid: { gap: 12 },
  skillRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  skillLabel: { fontSize: 12, color: "#666", width: 70 },
  skillBarBg: { flex: 1, height: 6, backgroundColor: "#f0f0f0", borderRadius: 3 },
  skillBar: { height: 6, backgroundColor: "#00c2c2", borderRadius: 3 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  sectionTitleWrapper: { flexDirection: "row", alignItems: "center" },
  viewAll: { fontSize: 13, color: "#00c2c2", fontWeight: "500" },
  achievementsRow: { flexDirection: "row", justifyContent: "space-around" },
  achieveItem: { alignItems: "center", gap: 8 },
  achieveCircle: { width: 65, height: 65, borderRadius: 32.5, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  achieveLabel: { fontSize: 11, color: "#555", textAlign: "center", fontWeight: "500" },
  settingsList: { marginTop: 8 },
  settingRow: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#f5f5f5",
  },
  signOutRow: { borderBottomWidth: 0 },
  settingIconWrapper: { width: 32 },
  settingLabel: { flex: 1, fontSize: 15, color: "#333" },
  systemBtn: { marginTop: 12, backgroundColor: "#111", borderRadius: 12, paddingVertical: 12, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 },
  systemBtnText: { color: "#fff", fontWeight: "700" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", padding: 20 },
  modalCard: { backgroundColor: "#fff", borderRadius: 16, padding: 16 },
  systemHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  systemOrb: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#e8f9f9", alignItems: "center", justifyContent: "center" },
  systemSub: { color: "#888", fontSize: 11, marginTop: 1 },
  talkDots: { color: "#00c2c2", fontWeight: "700", letterSpacing: 1 },
  systemInput: { borderWidth: 1, borderColor: "#eee", borderRadius: 10, padding: 10, minHeight: 84, marginTop: 10, color: "#111" },
  systemBubble: { marginTop: 12, backgroundColor: "#f7fcfc", borderRadius: 12, borderWidth: 1, borderColor: "#e5f5f5", padding: 10, flexDirection: "row", gap: 8, alignItems: "flex-start", minHeight: 70 },
  systemOutput: { color: "#333", lineHeight: 21, flex: 1 },
  closeLink: { marginTop: 10, alignSelf: "flex-end" },
});
