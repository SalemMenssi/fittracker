import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../services/config";

const FitTrackerScreen = ({ navigation }) => {
  const [summary, setSummary] = useState({ calories: 0, steps: 0, duration: 0 });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // New activity form state
  const [type, setType] = useState("");
  const [duration, setDuration] = useState("");
  const [calories, setCalories] = useState("");
  const [steps, setSteps] = useState("");

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem("@fittracker_token");
      if (!token) return;

      const [summaryRes, activitiesRes] = await Promise.all([
        fetch(`${API_URL}/activity/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/activity`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const summaryData = await summaryRes.json();
      const activitiesData = await activitiesRes.json();

      setSummary(summaryData);
      setActivities(activitiesData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const handleLogActivity = async () => {
    if (!type || !duration || !calories) {
      Alert.alert("Error", "Please fill in all mandatory fields");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("@fittracker_token");
      const response = await fetch(`${API_URL}/activity`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type,
          duration: parseInt(duration),
          calories: parseInt(calories),
          steps: parseInt(steps) || 0,
        }),
      });

      if (response.ok) {
        Alert.alert("Success", "Activity logged successfully!");
        setModalVisible(false);
        setType(""); setDuration(""); setCalories(""); setSteps("");
        fetchData();
      } else {
        Alert.alert("Error", "Failed to log activity");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00c2c2" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FitTracker</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Daily Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.sectionTitle}>Daily Progress</Text>
          <View style={styles.statsGrid}>
            <StatCard icon="flame" label="Calories" value={summary.calories} unit="kcal" color="#ff6b6b" />
            <StatCard icon="walk" label="Steps" value={summary.steps} unit="steps" color="#4dabf7" />
            <StatCard icon="time" label="Active" value={summary.duration} unit="min" color="#51cf66" />
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Log New Activity</Text>
        </TouchableOpacity>

        {/* Activity List */}
        <View style={styles.listContainer}>
          <Text style={styles.sectionTitle}>Recent Activities</Text>
          {activities.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="barbell-outline" size={48} color="#ddd" />
              <Text style={styles.emptyStateText}>No activities logged yet.</Text>
            </View>
          ) : (
            activities.map((item, index) => (
              <View key={item._id || index} style={styles.activityCard}>
                <View style={[styles.activityIcon, { backgroundColor: index % 2 === 0 ? "#e3fafc" : "#fff4e6" }]}>
                  <Ionicons name="fitness" size={20} color={index % 2 === 0 ? "#0c8599" : "#d9480f"} />
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityType}>{item.type}</Text>
                  <Text style={styles.activityDate}>{new Date(item.date).toLocaleDateString()}</Text>
                </View>
                <View style={styles.activityStats}>
                  <Text style={styles.activityValue}>{item.calories} kcal</Text>
                  <Text style={styles.activitySubValue}>{item.duration} min</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Modal for logging activity */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Activity</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#111" />
              </TouchableOpacity>
            </View>

            <TextInput style={styles.input} placeholder="Activity Type (e.g., Running)" value={type} onChangeText={setType} />
            <TextInput style={styles.input} placeholder="Duration (minutes)" value={duration} onChangeText={setDuration} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Calories Burnt" value={calories} onChangeText={setCalories} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Steps (optional)" value={steps} onChangeText={setSteps} keyboardType="numeric" />

            <TouchableOpacity style={styles.saveButton} onPress={handleLogActivity}>
              <Text style={styles.saveButtonText}>Save Activity</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const StatCard = ({ icon, label, value, unit, color }) => (
  <View style={styles.statCard}>
    <Ionicons name={icon} size={24} color={color} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statUnit}>{unit}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "#fff",
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#111" },
  summaryContainer: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#111", marginBottom: 15 },
  statsGrid: { flexDirection: "row", justifyContent: "space-between" },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 15,
    width: "30%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statValue: { fontSize: 18, fontWeight: "bold", color: "#111", marginTop: 8 },
  statLabel: { fontSize: 12, color: "#888", marginTop: 4 },
  statUnit: { fontSize: 10, color: "#aaa" },
  addButton: {
    flexDirection: "row",
    backgroundColor: "#00c2c2",
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  addButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  listContainer: { padding: 20 },
  activityCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 15,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  activityIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  activityInfo: { flex: 1, marginLeft: 15 },
  activityType: { fontSize: 16, fontWeight: "bold", color: "#111" },
  activityDate: { fontSize: 12, color: "#aaa", marginTop: 2 },
  activityStats: { alignItems: "flex-end" },
  activityValue: { fontSize: 14, fontWeight: "bold", color: "#111" },
  activitySubValue: { fontSize: 12, color: "#888" },
  emptyState: { alignItems: "center", padding: 40 },
  emptyStateText: { marginTop: 10, color: "#aaa" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#fff", borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, minHeight: 400 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: "bold" },
  input: { backgroundColor: "#f1f3f5", borderRadius: 10, padding: 15, marginBottom: 15, fontSize: 16 },
  saveButton: { backgroundColor: "#00c2c2", padding: 18, borderRadius: 12, alignItems: "center", marginTop: 10 },
  saveButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

export default FitTrackerScreen;
