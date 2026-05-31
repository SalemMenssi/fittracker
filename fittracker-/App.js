import React, { useState, useEffect } from 'react';
import { registerRootComponent } from 'expo';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import RootNavigator from './Src/navigation/RootNavigator';
import { ROUTES } from './Src/navigation/routes';
import { getCurrentUser, getProfile } from './Src/services/AuthService';
import { initCourses, getAllCourses } from './Src/services/CourseService';
import { initPosts } from './Src/services/SocialService';
import { initPerformanceMetrics } from './Src/services/performanceService';
import {
  configureNotificationHandler,
  registerForPushNotificationsAsync,
  scheduleStreakProtectionNotification,
  scheduleDailyQuestReminder,
} from './Src/services/notificationService';

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const bootstrap = async () => {
      configureNotificationHandler();

      await Promise.all([initCourses(), initPosts(), initPerformanceMetrics()]);

      const allRoutines = await getAllCourses();
      const joinedRoutines = allRoutines.filter((c) => c.Status === true);
      const allTasks = joinedRoutines.flatMap((c) => c.Tasks || []);
      await scheduleStreakProtectionNotification(allTasks);

      const user = await getCurrentUser();

      if (user?.isAdmin) {
        setInitialRoute(ROUTES.ADMIN_ROOT);
      } else if (user) {
        const profile = await getProfile().catch(() => user);
        const needsOnboarding =
          profile?.hasCompletedOnboarding === false ||
          (profile?.hasCompletedOnboarding == null && profile?.onboardingComplete === false);
        if (needsOnboarding) {
          setInitialRoute(ROUTES.ONBOARDING);
        } else {
          setInitialRoute(ROUTES.USER);
          await registerForPushNotificationsAsync();
          const reminderTime =
            profile?.notificationSettings?.dailyQuestTime || profile?.reminderTime || '08:00';
          await scheduleDailyQuestReminder(reminderTime);
        }
      } else {
        setInitialRoute(ROUTES.LOGIN);
      }
    };
    bootstrap();
  }, []);

  if (!initialRoute) {
    return (
      <View style={styles.splash}>
        <Ionicons name="barbell-outline" size={48} color="#00c2c2" />
        <Text style={styles.splashTitle}>FitTracker</Text>
        <ActivityIndicator size="small" color="#00c2c2" style={{ marginTop: 24 }} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootNavigator initialRouteName={initialRoute} />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f6f8',
  },
  splashTitle: {
    marginTop: 16,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111',
  },
});

registerRootComponent(App);
