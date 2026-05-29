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
import { getAllCourses, leaveCourse } from "../services/CourseService";
import { getProfile } from "../services/AuthService";
import { useIsFocused } from "@react-navigation/native";
import { Alert } from "react-native";

export default function HomeScreen({ navigation }) {
  const isFocused = useIsFocused();
  const [activeFilter, setActiveFilter] = useState("All Types");
  const filters = ["All Types", "Study", "Fitness", "Discipline", "Productivity", "Mental Focus", "Health", "Skill Building", "Daily Life"];
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const quickIcons = [
    { label: "Routines", icon: "barbell-outline", screen: "Routines" },

    { label: "Leader Board", icon: "podium-outline", screen: "LeaderBoard" },
    { label: "Awards", icon: "trophy-outline", screen: "Awards" },
    { label: "Social", icon: "people-outline", screen: "Social" },
    { label: "Tests", icon: "school-outline", screen: "TestsList" },
    { label: "Challenges", icon: "flash-outline", screen: "Challenges" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const p = await getProfile();
        setUser(p);

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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f6f8" />

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Welcome */}
        <View style={styles.welcomeRow}>
          <View>
            <Text style={styles.welcomeSmall}>Welcome back,</Text>
            <Text style={styles.welcomeName}>{user?.fullName || 'Athlete'}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('PersonalInfo')}>
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

        {/* Quick Icons */}
        <View style={styles.iconsRow}>
          {quickIcons.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.iconItem}
              onPress={() => navigation.navigate(item.screen)}
            >
              <View style={styles.iconCircle}>
                <Ionicons name={item.icon} size={28} color="#00c2c2" />
              </View>
              <Text style={styles.iconLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recommended */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AllCourses')}>
            <Text style={styles.seeAll}>See All</Text>
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
          {recommendedCourses.map((course) => (
            <TouchableOpacity
              key={course.id}
              style={styles.recCard}
              onPress={() => navigation.navigate('CourseDetail', { Item: course })}
            >
              <Image source={{ uri: course.image }} style={styles.recCardImage} />
              <View style={styles.recCardOverlay}>
                <View style={styles.recCardBadge}>
                  <Text style={styles.recCardBadgeText}>{course.workoutType}</Text>
                </View>
                <Text style={styles.recCardTitle} numberOfLines={1}>{course.title}</Text>
              </View>
            </TouchableOpacity>
          ))}
          {recommendedCourses.length === 0 && (
            <Text style={{ color: "#888", paddingHorizontal: 20 }}>No courses found for this filter.</Text>
          )}
        </ScrollView>

        {/* Continue Learning */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Continue Quests</Text>
          <Text style={styles.activeText}>{continueLearning.length} Active</Text>
        </View>

        {continueLearning.map((item) => {
          // Calculate progress dynamically
          const total = item.Tasks?.length || 0;
          const completed = item.Tasks?.filter(t => t.status === 'done')?.length || 0;
          const progress = total > 0 ? completed / total : 0;

          return (
            <TouchableOpacity
              key={item.id}
              style={styles.learnCard}
              onPress={() => navigation.navigate('CourseDetail', { Item: item })}
            >
              <View style={[styles.learnThumb, { backgroundColor: `#00c2c220` }]}>
                <Ionicons name="play-circle" size={28} color="#00c2c2" />
              </View>
              <View style={styles.learnInfo}>
                <Text style={styles.learnTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.learnSubtitle}>
                  {completed} of {total} Tasks Completed
                </Text>
                <View style={styles.learnProgressBg}>
                  <View
                    style={[
                      styles.learnProgressFill,
                      { width: `${progress * 100}%`, backgroundColor: '#00c2c2' },
                    ]}
                  />
                </View>
              </View>
              <View style={styles.learnActions}>
                <TouchableOpacity onPress={() => navigation.navigate('CourseDetail', { Item: item, editMode: true })}>
                  <Ionicons name="pencil-outline" size={20} color="#00c2c2" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleLeave(item.id)}>
                  <Ionicons name="trash-outline" size={20} color="#ff4d4d" />
                </TouchableOpacity>
                <Ionicons name="chevron-forward-outline" size={24} color="#ccc" />
              </View>
            </TouchableOpacity>
          )
        })}

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
    fontWeight: "bold",
    color: "#111",
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
});