import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
  Animated,
  Modal,
  Vibration,
} from "react-native";
import { useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { getCourseById, joinCourse, leaveCourse, updateTaskStatus, updateCourse } from "../../services/CourseService";
import { getProfile, updateUser } from "../../services/AuthService";
import { markAchievementEarned } from "../../services/AchievementService";
import { gainXP, assignClass } from "../../services/performanceService";
import { scheduleTaskNotification } from "../../services/notificationService";
import { useIsFocused } from "@react-navigation/native";
import { getRoutineStats, AnimatedProgressBar } from "../../components/RoutineCard";
import BackButton from "../../components/BackButton";

const BENEFITS = {
  Study: 'Sharper focus & better retention',
  Fitness: 'Strength, stamina & mobility',
  Discipline: 'Daily consistency & self-control',
  Productivity: 'More output with less friction',
  'Mental Focus': 'Clearer thinking under pressure',
  Health: 'Energy, sleep & wellbeing',
  'Skill Building': 'Master new abilities step by step',
  'Daily Life': 'Balanced habits that stick',
};

function TaskRow({ task, isJoined, onToggle }) {
  const scale = useRef(new Animated.Value(1)).current;
  const isDone = task.status === 'done';

  const handlePress = () => {
    if (!isJoined) return;
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.04, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
    onToggle(task.id, isDone);
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={[styles.taskCard, !isJoined && { opacity: 0.6 }]}
        disabled={!isJoined}
        onPress={handlePress}
        activeOpacity={0.85}
      >
        <View style={styles.checkboxContainer}>
          <View style={[styles.checkbox, isDone && styles.checkboxChecked]}>
            {isDone && <Ionicons name="checkmark" size={14} color="#fff" />}
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.taskTitleRow}>
              <Text style={[styles.taskTitle, isDone && styles.taskTitleDone]}>{task.title}</Text>
              {task.time ? (
                <View style={styles.timeBadge}>
                  <Ionicons name="alarm-outline" size={12} color="#00c2c2" />
                  <Text style={styles.timeBadgeText}>{task.time}</Text>
                </View>
              ) : null}
            </View>
            {task.description ? (
              <Text style={styles.taskDescription}>{task.description}</Text>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function CourseDetailScreen({ navigation, route }) {
  const isFocused = useIsFocused();
  const { Item } = route.params;
  const [course, setCourse] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [editMode, setEditMode] = useState(route.params.editMode || false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDesc, setEditedDesc] = useState("");
  const scrollRef = useRef(null);
  const tasksSectionY = useRef(0);
  const expAnim = useRef(new Animated.Value(0)).current;
  const [expText, setExpText] = useState("");
  const [rewardModal, setRewardModal] = useState({ visible: false, title: "", body: "" });
  const [sparkleAnim] = useState(new Animated.Value(0));
  const headerFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!loading && course) {
      Animated.timing(headerFade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }
  }, [loading, course]);

  useEffect(() => {
    const loadData = async () => {
      if (!Item?.id) return;
      try {
        const [c, u] = await Promise.all([
          getCourseById(Item.id),
          getProfile()
        ]);
        setCourse(c);
        setUser(u);
        setEditedTitle(c.title);
        setEditedDesc(c.description);
        const today = new Date().toISOString().split("T")[0];
        if (u?.lastResetDate !== today) {
          await updateUser({ lastResetDate: today, completedDailyTasks: [] });
        }
      } finally {
        setLoading(false);
      }
    };
    if (isFocused) loadData();
  }, [isFocused, Item]);

  const isJoined = user?.joinedCourses?.some(jc => (jc._id || jc) === course?.id);

  const handleJoin = async () => {
    try {
      setWorking(true);
      await joinCourse(course.id);

      // Refresh user profile to reflect joined status
      const updatedUser = await getProfile();
      setUser(updatedUser);

      // Award points for joining
      if (updatedUser) {
        await updateUser({ points: (updatedUser.points || 0) + 10, coursesCompleted: (updatedUser.coursesCompleted || 0) + 1 });
        await markAchievementEarned("challenge_accepted");
      }
      Alert.alert("Joined", `You're now following "${course.title}". Complete tasks to earn XP.`);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to join course.");
    } finally {
      setWorking(false);
    }
  };

  const handleLeave = async () => {
    Alert.alert(
      "Leave Course",
      "Are you sure you want to stop following this course?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Leave", 
          style: "destructive",
          onPress: async () => {
            try {
              setWorking(true);
              await leaveCourse(course.id);
              const updatedUser = await getProfile();
              setUser(updatedUser);
              Alert.alert("Success", "You have left the course.");
            } catch (e) {
              Alert.alert("Error", "Could not leave course.");
            } finally {
              setWorking(false);
            }
          }
        }
      ]
    );
  };

  const handleSave = async () => {
    try {
      setWorking(true);
      const updated = await updateCourse({
        id: course.id,
        title: editedTitle,
        description: editedDesc,
      });
      setCourse(updated);
      setEditMode(false);
      Alert.alert("Success", "Course updated successfully!");
    } catch (e) {
      Alert.alert("Error", "Failed to update course.");
    } finally {
      setWorking(false);
    }
  };

  const toggleTask = async (taskId, isCurrentlyDone) => {
    if (!isJoined) return;
    try {
      setCourse(prev => {
        const newCourse = { ...prev };
        const taskIdx = newCourse.Tasks.findIndex(t => t.id === taskId);
        newCourse.Tasks[taskIdx].status = !isCurrentlyDone ? "done" : "pending";
        return newCourse;
      });
      await updateTaskStatus(course.id, taskId, !isCurrentlyDone);
      // Award EXP and achievements for completion
      if (!isCurrentlyDone) {
        await gainXP(20);
        await assignClass();
        await markAchievementEarned("first_quest_complete");
        setExpText("+20 EXP • Quest Complete");
        setRewardModal({
          visible: true,
          title: "Quest Complete",
          body: "Reward gained: +20 EXP\nAchievement check updated.",
        });
        Animated.sequence([
          Animated.timing(expAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
          Animated.delay(900),
          Animated.timing(expAnim, { toValue: 0, duration: 260, useNativeDriver: true }),
        ]).start();
        Animated.sequence([
          Animated.timing(sparkleAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
          Animated.timing(sparkleAnim, { toValue: 0, duration: 380, useNativeDriver: true }),
        ]).start();
        Vibration.vibrate(120);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !course) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#00c2c2" />
      </SafeAreaView>
    );
  }

  const totalTasks = course.Tasks?.length || 0;
  const completedCount = course.Tasks?.filter(t => t.status === "done").length || 0;
  const progressPercent = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;
  const { progress } = getRoutineStats(course);

  return (
    <SafeAreaView style={styles.container}>
      <Modal transparent visible={rewardModal.visible} animationType="fade" onRequestClose={() => setRewardModal({ visible: false, title: "", body: "" })}>
        <View style={styles.modalOverlay}>
          <View style={styles.rewardModal}>
            <Animated.Text style={[styles.sparkle, { opacity: sparkleAnim, transform: [{ scale: sparkleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.15] }) }] }]}>✨ ✨ ✨</Animated.Text>
            <Text style={styles.rewardTitle}>{rewardModal.title}</Text>
            <Text style={styles.rewardBody}>{rewardModal.body}</Text>
            <TouchableOpacity style={styles.rewardBtn} onPress={() => setRewardModal({ visible: false, title: "", body: "" })}>
              <Text style={styles.rewardBtnText}>Nice</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.expToast, { opacity: expAnim, transform: [{ translateY: expAnim.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }) }] }]}>
          <Text style={styles.expToastText}>{expText}</Text>
        </Animated.View>

        <Animated.View style={{ opacity: headerFade }}>
        {/* Item Image */}
        <View style={styles.imageWrap}>
          <Image
            source={{ uri: course.image || 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400' }}
            style={styles.image}
          />
          <View style={styles.imageOverlay}>
            <BackButton navigation={navigation} color="#fff" onDark />
            {isJoined ? (
              <View style={styles.activePill}>
                <Ionicons name="pulse" size={14} color="#fff" />
                <Text style={styles.activePillText}>In progress</Text>
              </View>
            ) : <View />}
          </View>
        </View>

        {/* Title & Description */}
        {editMode ? (
          <View style={styles.editSection}>
            <Text style={styles.editLabel}>Routine Title</Text>
            <TextInput
              style={styles.editInput}
              value={editedTitle}
              onChangeText={setEditedTitle}
              placeholder="Title"
            />
            <Text style={styles.editLabel}>Description</Text>
            <TextInput
              style={[styles.editInput, { height: 80 }]}
              value={editedDesc}
              onChangeText={setEditedDesc}
              placeholder="Description"
              multiline
            />
            <View style={styles.editActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditMode(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <Text style={styles.mainTitle}>{course.title}</Text>
            <Text style={styles.subtitle}>{course.description}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaChip}>{course.workoutType || 'Routine'}</Text>
              <Text style={styles.metaChip}>{course.difficulty || 'Easy'}</Text>
              <Text style={styles.metaChip}>{course.duration || '30 min'}</Text>
              <Text style={styles.metaChip}>{totalTasks} tasks</Text>
            </View>
            {isJoined && totalTasks > 0 && (
              <View style={styles.headerProgress}>
                <AnimatedProgressBar progress={progress} height={8} />
                <Text style={styles.headerProgressText}>{completedCount}/{totalTasks} tasks done · {progress}%</Text>
              </View>
            )}

            <View style={styles.overviewGrid}>
              <View style={styles.overviewBox}>
                <Ionicons name="flash-outline" size={18} color="#ff8c42" />
                <Text style={styles.overviewVal}>~{getRoutineStats(course).xpEstimate} XP</Text>
                <Text style={styles.overviewLabel}>Total reward</Text>
              </View>
              <View style={styles.overviewBox}>
                <Ionicons name="list-outline" size={18} color="#00c2c2" />
                <Text style={styles.overviewVal}>{totalTasks}</Text>
                <Text style={styles.overviewLabel}>Tasks</Text>
              </View>
              <View style={styles.overviewBox}>
                <Ionicons name="time-outline" size={18} color="#666" />
                <Text style={styles.overviewVal}>{course.duration || '30m'}</Text>
                <Text style={styles.overviewLabel}>Session</Text>
              </View>
            </View>

            <View style={styles.benefitCard}>
              <Ionicons name="sparkles-outline" size={18} color="#00c2c2" />
              <Text style={styles.benefitCardText}>
                {BENEFITS[course.workoutType] || 'Build habits that compound over time.'}
              </Text>
            </View>
          </>
        )}

        {(course.Tasks || []).some((t) => t.time) && (
          <>
            <Text style={styles.sectionTitle}>Schedule</Text>
            <View style={styles.scheduleCard}>
              {course.Tasks.filter((t) => t.time).map((task) => (
                <View key={task.id} style={styles.scheduleRow}>
                  <Text style={styles.scheduleTime}>{task.time}</Text>
                  <Text style={styles.scheduleTask} numberOfLines={1}>{task.title}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Guidelines */}
        {course.rules?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Guidelines</Text>
            <View style={styles.rulesContainer}>
              {course.rules.map((rule, index) => (
                <Text key={index} style={styles.ruleText}>• {rule}</Text>
              ))}
            </View>
          </>
        )}

        {/* Tasks */}
        {course.Tasks?.length > 0 && (
          <View 
            collapsable={false}
            onLayout={(e) => tasksSectionY.current = e.nativeEvent.layout.y}
          >
            <Text style={styles.sectionTitle}>Tasks</Text>
            <Text style={styles.sectionHint}>Tap a task to mark complete · +20 XP each</Text>
            {course.Tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                isJoined={isJoined}
                onToggle={toggleTask}
              />
            ))}
          </View>
        )}

        {/* Progress */}
        {isJoined && course.Tasks?.length > 0 && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>Overall progress</Text>
            <AnimatedProgressBar progress={progressPercent} height={8} />
            <Text style={styles.progressSub}>{completedCount} of {totalTasks} tasks completed</Text>
          </View>
        )}
        </Animated.View>

        {isJoined ? (
          <View style={styles.joinedActionsRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.reminderBtn]}
              onPress={async () => {
                const pendingTasks = (course.Tasks || []).filter((t) => t.status !== "done");
                await Promise.all(pendingTasks.map((t) => scheduleTaskNotification({ title: t.title, time: t.time || "08:00" })));
                Alert.alert("System", "Daily reminder activated.");
              }}
            >
              <Ionicons name="notifications-outline" size={20} color="#00c2c2" />
              <Text style={styles.reminderBtnText}>Set Reminder</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.showTasksBtn]}
              onPress={() => {
                if (course.Tasks?.length > 0) {
                  const targetY = tasksSectionY.current > 0 ? tasksSectionY.current : 600;
                  scrollRef.current?.scrollTo({ y: targetY, animated: true });
                } else {
                  Alert.alert("Info", "No tasks available for this course.");
                }
              }}
            >
              <Ionicons name="list-outline" size={20} color="#fff" />
              <Text style={styles.showTasksBtnText}>Show Tasks</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.leaveBtn]}
              onPress={handleLeave}
            >
              <Ionicons name="log-out-outline" size={20} color="#ff4d4d" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.continueButton, working && { opacity: 0.7 }]}
            onPress={handleJoin}
            disabled={working}
          >
            {working ? <ActivityIndicator color="#fff" /> : <Text style={styles.continueButtonText}>Join Routine</Text>}
          </TouchableOpacity>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6f8" },
  continueButton: {
    backgroundColor: '#00c2c2',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  continueButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  imageWrap: { position: 'relative' },
  image: { width: '100%', height: 220 },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 12,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#00c2c2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  activePillText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  overviewGrid: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 20,
    marginTop: 16,
  },
  overviewBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#eef0f4',
  },
  overviewVal: { fontSize: 16, fontWeight: '800', color: '#111' },
  overviewLabel: { fontSize: 11, color: '#888', fontWeight: '600' },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginTop: 14,
    backgroundColor: '#e8fafa',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#00c2c233',
  },
  benefitCardText: { flex: 1, fontSize: 14, color: '#007a7a', fontWeight: '600', lineHeight: 20 },
  scheduleCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#eef0f4',
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5',
  },
  scheduleTime: { fontSize: 14, fontWeight: '800', color: '#00c2c2', width: 52 },
  scheduleTask: { flex: 1, fontSize: 14, color: '#444' },
  taskTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  taskTitleDone: { color: '#00c2c2', textDecorationLine: 'line-through' },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e8fafa',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  timeBadgeText: { fontSize: 11, color: '#00c2c2', fontWeight: '700' },
  progressSub: { fontSize: 12, color: '#888', marginTop: 6 },
  mainTitle: { fontSize: 22, fontWeight: "bold", marginHorizontal: 20, marginTop: 15 },
  subtitle: { fontSize: 14, color: "#666", marginHorizontal: 20, marginTop: 8, lineHeight: 20 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginHorizontal: 20, marginTop: 12 },
  metaChip: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
    backgroundColor: '#f0f2f5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  headerProgress: { marginHorizontal: 20, marginTop: 14 },
  headerProgressBg: { height: 6, backgroundColor: '#eef0f4', borderRadius: 3, overflow: 'hidden' },
  headerProgressFill: { height: '100%', backgroundColor: '#00c2c2' },
  headerProgressText: { fontSize: 12, color: '#00c2c2', fontWeight: '600', marginTop: 6 },
  sectionHint: { fontSize: 13, color: '#888', marginHorizontal: 20, marginTop: 4, marginBottom: 4 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginHorizontal: 20, marginTop: 20 },
  rulesContainer: { backgroundColor: "#fff", marginHorizontal: 20, padding: 15, borderRadius: 10, marginTop: 10 },
  ruleText: { fontSize: 14, marginBottom: 5 },
  taskCard: { backgroundColor: "#fff", marginHorizontal: 20, padding: 15, borderRadius: 10, marginTop: 10 },
  checkboxContainer: { flexDirection: "row", alignItems: "center" },
  checkbox: {
    width: 24, height: 24, borderWidth: 2, borderColor: "#00c2c2",
    borderRadius: 6, marginRight: 12, justifyContent: "center", alignItems: "center",
  },
  checkboxChecked: { backgroundColor: "#00c2c2" },
  checkmark: { color: "#fff", fontWeight: "bold" },
  taskTitle: { fontSize: 16, fontWeight: "600" },
  taskDescription: { fontSize: 13, color: "#666" },
  progressContainer: { margin: 20 },
  progressText: { fontSize: 12, marginBottom: 6, fontWeight: "600" },
  progressBar: { height: 6, backgroundColor: "#ddd", borderRadius: 3 },
  progressFill: { height: "100%", backgroundColor: "#00c2c2", borderRadius: 3 },

  joinedActionsRow: {
    flexDirection: "row",
    gap: 12,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1.5,
  },
  reminderBtn: {
    borderColor: "#00c2c2",
    backgroundColor: "#fff",
  },
  reminderBtnText: {
    color: "#00c2c2",
    fontWeight: "bold",
    fontSize: 15,
  },
  showTasksBtn: {
    backgroundColor: "#00c2c2",
    borderColor: "#00c2c2",
  },
  showTasksBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  leaveBtn: {
    flex: 0.2,
    borderColor: "#ff4d4d20",
    backgroundColor: "#fff",
  },
  editSection: { padding: 20, backgroundColor: "#fff", marginHorizontal: 20, borderRadius: 16, marginTop: 15 },
  editLabel: { fontSize: 12, color: "#888", marginBottom: 5, fontWeight: "bold" },
  editInput: { borderWidth: 1, borderColor: "#eee", borderRadius: 10, padding: 12, marginBottom: 15, fontSize: 16, color: "#111" },
  editActions: { flexDirection: "row", gap: 10 },
  saveBtn: { flex: 1, backgroundColor: "#00c2c2", padding: 12, borderRadius: 10, alignItems: "center" },
  saveBtnText: { color: "#fff", fontWeight: "bold" },
  cancelBtn: { flex: 1, backgroundColor: "#eee", padding: 12, borderRadius: 10, alignItems: "center" },
  cancelBtnText: { color: "#666", fontWeight: "bold" },
  expToast: {
    position: "absolute",
    zIndex: 5,
    top: 12,
    alignSelf: "center",
    backgroundColor: "#111",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  expToastText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  rewardModal: { width: "100%", backgroundColor: "#fff", borderRadius: 16, padding: 18, alignItems: "center" },
  sparkle: { fontSize: 22, marginBottom: 8 },
  rewardTitle: { fontSize: 18, fontWeight: "700", color: "#111", marginBottom: 8 },
  rewardBody: { fontSize: 13, color: "#666", textAlign: "center", lineHeight: 19 },
  rewardBtn: { marginTop: 14, backgroundColor: "#00c2c2", borderRadius: 10, paddingHorizontal: 18, paddingVertical: 10 },
  rewardBtnText: { color: "#fff", fontWeight: "700" },
});