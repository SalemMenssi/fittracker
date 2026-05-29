import React, { useState, useEffect } from "react";
import { registerRootComponent } from "expo";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

// ─── Auth & Services ───────────────────────────────────────────────────────────
import { getCurrentUser } from "./Src/services/AuthService";
import { initCourses, getAllCourses } from "./Src/services/CourseService";
import { initPosts } from "./Src/services/SocialService";
import { 
  requestNotificationPermission, 
  createAndroidNotificationChannel,
  scheduleStreakProtectionNotification
} from "./Src/services/notificationService";
import { initPerformanceMetrics } from "./Src/services/performanceService";

// ─── Auth Screens ──────────────────────────────────────────────────────────────
import HomeScreen from "./Src/Screen/HomeScreen";
import ProfileScreen from "./Src/Screen/ProfileScreen";
import RoutinesScreen from "./Src/Screen/RoutinesScreen";
import Loginscreen from "./Src/Screen/Loginscreen";
import SignUpScreen from "./Src/Screen/Signup";

// ─── Feature Screens ───────────────────────────────────────────────────────────
import CourseDetailScreen from "./Src/Screen/CourseDetailScreen";
import LessonDetailScreen from "./Src/Screen/LessonDetailScreen";
import AwardsScreen from "./Src/Screen/AwardsScreen";
import SocialScreen from "./Src/Screen/SocialScreen";
import TestScreen from "./Src/Screen/TestScreen";
import TestsListScreen from "./Src/Screen/TestsListScreen";
import LeaderBoardScreen from "./Src/Screen/LeaderBoardScreen";
import FitTrackerScreen from "./Src/Screen/FitTrackerScreen";
import ChallengesScreen from "./Src/Screen/ChallengesScreen";
import AdminUsersScreen from "./Src/Screen/AdminUsersScreen";
import AdminManageScreen from "./Src/Screen/AdminManageScreen";
import AdminSettingsScreen from "./Src/Screen/AdminSettingsScreen";

// ─── Courses ───────────────────────────────────────────────────────────────────
import CoursesScreen from "./Src/Screen/CoursesScreen";
import TermsScreen from "./Src/Screen/TermsScreen";

// ─── Profile Settings ──────────────────────────────────────────────────────────
import PersonalInfoScreen from "./Src/Screen/PersonalInfoScreen";
import NotificationsScreen from "./Src/Screen/NotificationsScreen";
import PrivacySecurityScreen from "./Src/Screen/PrivacySecurityScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Custom Tab Bar ────────────────────────────────────────────────────────────
const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.bottomNav}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;
        const isFocused = state.index === index;
        const icons = {
          Home: "home-outline",
          Profile: "person-circle-outline",
          Routines: "barbell-outline",
        };
        const color = isFocused ? "#00c2c2" : "#888";
        return (
          <TouchableOpacity
            key={index}
            onPress={() => navigation.navigate(route.name)}
            style={styles.navItem}
          >
            <Ionicons name={icons[route.name]} size={22} color={color} />
            <Text style={[styles.navLabel, isFocused && styles.navLabelActive]}>{label}</Text>
            {isFocused && <View style={styles.navDot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// ─── Bottom Tabs ───────────────────────────────────────────────────────────────
const UserTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Routines" component={RoutinesScreen} />
    </Tab.Navigator>
  );
};

const AdminTabBar = ({ state, descriptors, navigation }) => (
  <View style={styles.bottomNav}>
    {state.routes.map((route, index) => {
      const isFocused = state.index === index;
      const icons = {
        AdminUsers: "people-outline",
        AdminManage: "construct-outline",
        AdminSettings: "settings-outline",
      };
      const color = isFocused ? "#00c2c2" : "#888";
      return (
        <TouchableOpacity key={index} onPress={() => navigation.navigate(route.name)} style={styles.navItem}>
          <Ionicons name={icons[route.name]} size={22} color={color} />
          <Text style={[styles.navLabel, isFocused && styles.navLabelActive]}>{descriptors[route.key]?.options?.title || route.name}</Text>
          {isFocused && <View style={styles.navDot} />}
        </TouchableOpacity>
      );
    })}
  </View>
);

const AdminTabs = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <AdminTabBar {...props} />}>
    <Tab.Screen name="AdminUsers" component={AdminUsersScreen} options={{ title: "Users" }} />
    <Tab.Screen name="AdminManage" component={AdminManageScreen} options={{ title: "Manage" }} />
    <Tab.Screen name="AdminSettings" component={AdminSettingsScreen} options={{ title: "Settings" }} />
  </Tab.Navigator>
);

// ─── Generic Placeholder Screen ────────────────────────────────────────────────
const GenericScreen = ({ navigation, title }) => (
  <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f6f8" }}>
    <View style={{ flexDirection: "row", alignItems: "center", padding: 20, backgroundColor: "#fff" }}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5 }}>
        <Ionicons name="arrow-back" size={24} color="#111" />
      </TouchableOpacity>
      <Text style={{ fontSize: 18, fontWeight: "bold", color: "#111", marginLeft: 15 }}>{title}</Text>
    </View>
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", color: "#111" }}>{title}</Text>
      <Text style={{ fontSize: 14, color: "#888", marginTop: 8 }}>Coming Soon</Text>
    </View>
  </SafeAreaView>
);

// ─── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const bootstrap = async () => {
      // Setup notifications
      await requestNotificationPermission();
      await createAndroidNotificationChannel();
      
      // Initialize seed data
      const [_, __, performanceMetrics] = await Promise.all([initCourses(), initPosts(), initPerformanceMetrics()]);

      // Schedule streak protection logic
      const allRoutines = await getAllCourses();
      const joinedRoutines = allRoutines.filter(c => c.Status === true);
      const allTasks = joinedRoutines.flatMap(c => c.Tasks || []);
      await scheduleStreakProtectionNotification(allTasks);

      // Check for active session
      const user = await getCurrentUser();

      if (user?.isAdmin) {
        setInitialRoute("AdminRoot");
      } else if (user) {
        setInitialRoute("User");
      } else {
        setInitialRoute("Login");
      }
    };
    bootstrap();
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f6f8" }}>
        <Ionicons name="barbell-outline" size={48} color="#00c2c2" />
        <Text style={{ marginTop: 16, fontSize: 22, fontWeight: "bold", color: "#111" }}>FitTracker</Text>
        <ActivityIndicator size="small" color="#00c2c2" style={{ marginTop: 24 }} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false }}
      >
        {/* Auth Screens */}
        <Stack.Screen name="Login" component={Loginscreen} />
        <Stack.Screen name="Signup" component={SignUpScreen} />
        <Stack.Screen name="User" component={UserTabs} />
        <Stack.Screen name="AdminRoot" component={AdminTabs} />
        <Stack.Screen name="Test" component={TestScreen} />
        <Stack.Screen name="TestsList" component={TestsListScreen} />

        {/* Home Screens */}
        <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
        <Stack.Screen name="LessonDetail" component={LessonDetailScreen} />
        <Stack.Screen name="AllCourses" component={(props) => <GenericScreen {...props} title="All Courses" />} />
        <Stack.Screen name="Workouts" component={FitTrackerScreen} />
        <Stack.Screen name="Explore" component={(props) => <GenericScreen {...props} title="Explore" />} />
        <Stack.Screen name="Awards" component={AwardsScreen} />
        <Stack.Screen name="Social" component={SocialScreen} />
        <Stack.Screen name="Search" component={(props) => <GenericScreen {...props} title="Search" />} />
        <Stack.Screen name="LeaderBoard" component={LeaderBoardScreen} />
        <Stack.Screen name="Challenges" component={ChallengesScreen} />

        {/* Courses Screens */}
        <Stack.Screen name="Courses" component={CoursesScreen} />
        <Stack.Screen name="CategoryDetail" component={(props) => <GenericScreen {...props} title="Category Detail" />} />
        <Stack.Screen name="ContinueLessons" component={(props) => <GenericScreen {...props} title="Continue Lessons" />} />
        <Stack.Screen name="About" component={(props) => <GenericScreen {...props} title="About" />} />
        <Stack.Screen name="Privacy" component={(props) => <GenericScreen {...props} title="Privacy" />} />
        <Stack.Screen name="Terms" component={TermsScreen} />
        <Stack.Screen name="Contact" component={(props) => <GenericScreen {...props} title="Contact" />} />

        {/* Profile Screens */}
        <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
        <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} />
        <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />

        {/* Generic Profile Sub-Screens */}
        <Stack.Screen name="EditProfile" component={(props) => <GenericScreen {...props} title="Edit Profile" />} />
        <Stack.Screen name="Settings" component={(props) => <GenericScreen {...props} title="Settings" />} />
        <Stack.Screen name="StatYears" component={(props) => <GenericScreen {...props} title="Years Stats" />} />
        <Stack.Screen name="StatKg" component={(props) => <GenericScreen {...props} title="Weight Stats" />} />
        <Stack.Screen name="StatCm" component={(props) => <GenericScreen {...props} title="Height Stats" />} />
        <Stack.Screen name="StatCourses" component={(props) => <GenericScreen {...props} title="Courses Stats" />} />
        <Stack.Screen name="WeeklyActivity" component={(props) => <GenericScreen {...props} title="Weekly Activity" />} />
        <Stack.Screen name="AllAchievements" component={(props) => <GenericScreen {...props} title="All Achievements" />} />
        <Stack.Screen name="AchievementStreak" component={(props) => <GenericScreen {...props} title="7 Day Streak" />} />
        <Stack.Screen name="AchievementGoal" component={(props) => <GenericScreen {...props} title="Goal Smasher" />} />
        <Stack.Screen name="AchievementEarlyBird" component={(props) => <GenericScreen {...props} title="Early Bird" />} />
        <Stack.Screen name="StrengthDetails" component={(props) => <GenericScreen {...props} title="Strength Details" />} />
        <Stack.Screen name="CardioDetails" component={(props) => <GenericScreen {...props} title="Cardio Details" />} />
        <Stack.Screen name="YogaDetails" component={(props) => <GenericScreen {...props} title="Yoga Details" />} />
        <Stack.Screen name="HIITDetails" component={(props) => <GenericScreen {...props} title="HIIT Details" />} />
        <Stack.Screen name="RecoveryDetails" component={(props) => <GenericScreen {...props} title="Recovery Details" />} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 25,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  navLabel: {
    fontSize: 11,
    color: "#aaa",
  },
  navLabelActive: {
    color: "#00c2c2",
    fontWeight: "600",
  },
  navDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#00c2c2",
    marginTop: 2,
  },
});

registerRootComponent(App);